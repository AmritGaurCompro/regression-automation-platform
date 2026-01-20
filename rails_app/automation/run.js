const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');


function runTests(testFile) {
  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const startTime = Date.now();
  
  const command = `npx playwright test ${testFile}`;

  return new Promise((resolve) => {
    const childProcess = exec(command, {
      cwd: __dirname,
      maxBuffer: 10 * 1024 * 1024
    });

    childProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    childProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    childProcess.on('close', (exitCode) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      const artifactsDir = path.join(__dirname, 'artifacts');
      const runs = fs.existsSync(artifactsDir) 
        ? fs.readdirSync(artifactsDir).filter(dir => dir.startsWith('run-'))
        : [];
      
      const latestRun = runs.length > 0 ? runs[runs.length - 1] : null;
      const outputDir = latestRun ? path.join(artifactsDir, latestRun) : null;

      const result = {
        runId: runId,
        success: exitCode === 0,
        exitCode: exitCode,
        testFile: testFile,
        duration: parseFloat(duration),
        outputDir: outputDir,
        timestamp: new Date().toISOString()
      };

      if (outputDir) {
        const jsonReport = path.join(outputDir, 'result.json');
        if (fs.existsSync(jsonReport)) {
          try {
            const report = JSON.parse(fs.readFileSync(jsonReport, 'utf8'));
            result.stats = getStats(report);
            result.tests = getTestDetails(report);
            result.reports = {
              json: jsonReport,
              html: path.join(outputDir, 'index.html')
            };
          } catch (err) {
            console.error('Error reading report:', err.message);
          }
        }
      }

      console.log('\n' + '='.repeat(60));
      console.log(`Duration: ${duration}s`);
      console.log(`Exit Code: ${exitCode}`);
      if (result.stats) {
        console.log(`Tests: ${result.stats.passed} passed, ${result.stats.failed} failed, ${result.stats.total} total`);
      }
      console.log('='.repeat(60));
      
      console.log('\n---RESULT---');
      console.log(JSON.stringify(result));
      console.log('---END---');

      resolve(result);
    });

    childProcess.on('error', (error) => {
      console.error('Error:', error.message);
      const result = {
        runId: runId,
        success: false,
        exitCode: 1,
        testFile: testFile,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      console.log('\n---RESULT---');
      console.log(JSON.stringify(result));
      console.log('---END---');
      
      resolve(result);
    });
  });
}

function getStats(report) {
  const stats = { total: 0, passed: 0, failed: 0, skipped: 0 };
  
  const countTests = (suites) => {
    suites.forEach(suite => {
      if (suite.specs) {
        suite.specs.forEach(spec => {
          stats.total++;
          if (spec.ok) {
            stats.passed++;
          } else if (spec.tests && spec.tests.every(t => t.results.every(r => r.status === 'skipped'))) {
            stats.skipped++;
          } else {
            stats.failed++;
          }
        });
      }
      if (suite.suites) {
        countTests(suite.suites);
      }
    });
  };
  
  if (report.suites) {
    countTests(report.suites);
  }
  
  return stats;
}

function getTestDetails(report) {
  const tests = [];
  
  const processSpecs = (suites) => {
    suites.forEach(suite => {
      if (suite.specs) {
        suite.specs.forEach(spec => {
          tests.push({
            title: spec.title,
            file: suite.file || '',
            status: spec.ok ? 'passed' : 'failed',
            duration: spec.tests ? spec.tests[0].results[0].duration : 0
          });
        });
      }
      if (suite.suites) {
        processSpecs(suite.suites);
      }
    });
  };
  
  if (report.suites) {
    processSpecs(report.suites);
  }
  
  return tests;
}

if (require.main === module) {
  let testFile = process.argv[2];
  
  if (!testFile) {
    console.error('Error: Please provide a test file');
    console.error('Usage: node run.js <test-file>');
    console.error('Example: node run.js login.spec.js');
    process.exit(1);
  }

  if (!testFile.startsWith('tests/') && !testFile.startsWith('tests\\')) {
    testFile = 'tests/' + testFile;
  }

  const testFilePath = path.join(__dirname, testFile);
  if (!fs.existsSync(testFilePath)) {
    console.error(`Error: Test file not found: ${testFile}`);
    console.error(`Looking for: ${testFilePath}`);
    process.exit(1);
  }

  testFile = testFile.replace(/\\/g, '/');

  runTests(testFile)
    .then((result) => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      const errorResult = {
        runId: new Date().toISOString().replace(/[:.]/g, '-'),
        success: false,
        exitCode: 1,
        testFile: testFile,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      console.log(JSON.stringify(errorResult));
      process.exit(0);
    });
}

module.exports = { runTests };
