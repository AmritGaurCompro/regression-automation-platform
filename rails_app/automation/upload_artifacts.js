const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadArtifacts() {
  const artifactsDir = path.join(__dirname, 'artifacts');
  const railsApiUrl = process.env.RAILS_API_URL;
  const testRunId = process.env.TEST_RUN_ID;
  const testId = process.env.TEST_ID;

  if (!fs.existsSync(artifactsDir)) {
    console.log('No artifacts directory found');
    return;
  }

  const runs = fs.readdirSync(artifactsDir).filter(d => d.startsWith('run-'));
  if (!runs.length) {
    console.log('No run folders found');
    return;
  }

  const latestRun = runs[runs.length - 1];
  const runDir = path.join(artifactsDir, latestRun);
  const resultJsonPath = path.join(runDir, 'result.json');

  if (!fs.existsSync(resultJsonPath)) {
    console.log('No result.json found');
    return;
  }

  const resultData = JSON.parse(fs.readFileSync(resultJsonPath, 'utf8'));
  const results = resultData?.suites?.[0]?.specs?.[0]?.tests?.[0]?.results || [];
  const failedResult = results.find(r => r.errors?.length);

  const uploadedArtifacts = [];

  if (failedResult) {
    for (const att of (failedResult.attachments || [])) {
      if (att.name === 'error-context' || !att.path) continue;
      if (!fs.existsSync(att.path)) continue;

      try {
        const result = await cloudinary.uploader.upload(att.path, {
          resource_type: 'auto',
          folder: process.env.ENVIRONMENT || 'QA'
        });
        uploadedArtifacts.push({
          kind: att.name,
          file_url: result.secure_url
        });
        console.log(`Uploaded ${att.name}: ${result.secure_url}`);
      } catch (err) {
        console.error(`Failed to upload ${att.name}:`, err.message);
      }
    }
  }

  // Send to Rails API
  if (testRunId && testId && railsApiUrl) {
    try {
      const response = await fetch(
        `${railsApiUrl}/api/tests/${testId}/test_runs/${testRunId}/artifacts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artifacts: uploadedArtifacts,
            errors: failedResult?.errors || [],
            success: !failedResult,
            result: resultData
          })
        }
      );
      console.log('Rails API response:', response.status);
    } catch (err) {
      console.error('Failed to notify Rails API:', err.message);
    }
  } else {
    console.log('Missing TEST_RUN_ID, TEST_ID or RAILS_API_URL - skipping Rails notification');
  }
}

uploadArtifacts().catch(console.error);
