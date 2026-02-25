/**
 * upload_artifacts.js
 *
 * Runs AFTER run.js completes (on GitHub Actions).
 * 1. Finds the latest run folder inside automation/artifacts/
 * 2. Reads result.json to get attachment paths + error info
 * 3. Uploads each attachment to Cloudinary
 * 4. POSTs the Cloudinary URLs + metadata to your Rails API webhook
 * 5. Deletes the artifacts folder (mirrors what UploadArtifactsJob does locally)
 *
 * Mirrors the logic in UploadArtifactsJob so Rails behavior is identical
 * whether the test ran locally or on GitHub Actions.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ─── Config from env vars (set as GitHub Secrets) ──────────────────────────
const RAILS_API_URL   = process.env.RAILS_API_URL;    // e.g. https://yourapp.onrender.com
const CLOUD_NAME      = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY         = process.env.CLOUDINARY_API_KEY;
const API_SECRET      = process.env.CLOUDINARY_API_SECRET;
const TEST_RUN_ID     = process.env.TEST_RUN_ID;       // passed from run.js output

if (!RAILS_API_URL || !CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('❌ Missing required environment variables:');
  console.error('   RAILS_API_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  process.exit(1);
}

const artifactsRoot = path.join(__dirname, 'artifacts');

// ─── Helpers ────────────────────────────────────────────────────────────────

function uploadToCloudinary(filePath, folder) {
  return new Promise((resolve, reject) => {
    // Dynamically require cloudinary (installed via npm install cloudinary)
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET });

    cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
      folder: folder || 'playwright_artifacts'
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
  });
}

function postToRails(endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url  = new URL(endpoint);
    const lib  = url.protocol === 'https:' ? https : http;

    const options = {
      hostname: url.hostname,
      port:     url.port || (url.protocol === 'https:' ? 443 : 80),
      path:     url.pathname,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(data),
        'X-GH-Actions':   'true'   // so Rails can identify it came from GH Actions
      }
    };

    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`  → Rails responded: ${res.statusCode} ${body}`);
        resolve(res.statusCode);
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function cleanupArtifacts() {
  if (fs.existsSync(artifactsRoot)) {
    fs.rmSync(artifactsRoot, { recursive: true, force: true });
    console.log('🗑️  Artifacts folder deleted');
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('📤 Artifact Upload to Cloudinary');
  console.log('='.repeat(60));

  if (!fs.existsSync(artifactsRoot)) {
    console.log('ℹ️  No artifacts folder found — skipping upload');
    return;
  }

  // Find latest run- folder by modified time
  // Mirrors: Dir.children(artifacts_root).map { |f| [f, File.mtime(...)] }.max_by(&:last)
  const runs = fs.readdirSync(artifactsRoot)
    .filter(d => {
      const full = path.join(artifactsRoot, d);
      return fs.statSync(full).isDirectory(); // only directories
    })
    .map(d => ({
      name:  d,
      mtime: fs.statSync(path.join(artifactsRoot, d)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime); // latest first

  if (runs.length === 0) {
    console.log('ℹ️  No run folders found inside artifacts/ — skipping');
    return;
  }

  const latestFolder = runs[0].name; // latest by mtime, same as Ruby's max_by
  const folderPath   = path.join(artifactsRoot, latestFolder);
  const resultJson   = path.join(folderPath, 'result.json');

  console.log(`📁 Latest run folder: ${latestFolder}`);

  if (!fs.existsSync(resultJson)) {
    console.log('⚠️  result.json not found — skipping upload but cleaning up');
    cleanupArtifacts();
    return;
  }

  const data    = JSON.parse(fs.readFileSync(resultJson, 'utf8'));
  const results = data?.suites?.[0]?.specs?.[0]?.tests?.[0]?.results || [];
  const failed  = results.find(r => r.errors?.length > 0);

  if (!failed) {
    console.log('✅ No errors found in result.json — skipping upload');
    cleanupArtifacts();
    return;
  }

  console.log('❌ Errors found — uploading artifacts...\n');

  // 1. Post error log to Rails (no file upload needed, just metadata)
  try {
    await postToRails(`${RAILS_API_URL}/api/artifacts/webhook`, {
      test_run_id:   TEST_RUN_ID,
      kind:          'error_log',
      file_url:      null,
      metadata:      failed.errors,
      source:        'github_actions'
    });
    console.log('  ✅ Error log sent to Rails');
  } catch (err) {
    console.error('  ❌ Failed to send error log to Rails:', err.message);
  }

  // 2. Upload each attachment to Cloudinary then notify Rails
  const attachments = (failed.attachments || []).filter(a => a.name !== 'error-context');

  for (const att of attachments) {
    if (!att.path || !fs.existsSync(att.path)) {
      console.log(`  ⚠️  Skipping missing file: ${att.path}`);
      continue;
    }

    console.log(`  📎 Uploading: ${att.name} → ${att.path}`);

    try {
      const cloudinaryUrl = await uploadToCloudinary(att.path, process.env.NODE_ENV || 'production');
      console.log(`  ✅ Uploaded: ${cloudinaryUrl}`);

      await postToRails(`${RAILS_API_URL}/api/artifacts/webhook`, {
        test_run_id: TEST_RUN_ID,
        kind:        att.name,
        file_url:    cloudinaryUrl,
        source:      'github_actions'
      });
      console.log(`  ✅ Rails notified for: ${att.name}`);
    } catch (err) {
      console.error(`  ❌ Failed for ${att.name}:`, err.message);
    }
  }

  // 3. Cleanup — mirrors UploadArtifactsJob#cleanup_artifacts_folder
  cleanupArtifacts();

  // 4. Tell Rails the final test run status
  // Mirrors: test_run.update!(status: result["success"] ? "passed" : "failed")
  // which RunPlaywrightJob does locally after parsing ---RESULT---
  const overallSuccess = data?.stats?.unexpected === 0;
  try {
    await postToRails(`${RAILS_API_URL}/api/artifacts/status`, {
      test_run_id: TEST_RUN_ID,
      success:     String(overallSuccess)
    });
    console.log(`  ✅ TestRun status updated to: ${overallSuccess ? 'passed' : 'failed'}`);
  } catch (err) {
    console.error('  ❌ Failed to update test run status:', err.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Upload complete');
  console.log('='.repeat(60) + '\n');
}

main().catch(err => {
  console.error('Fatal error in upload_artifacts.js:', err);
  cleanupArtifacts(); // always cleanup even on crash
  process.exit(1);
});
