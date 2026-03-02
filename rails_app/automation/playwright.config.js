const { defineConfig, devices } = require('@playwright/test');

const runId = new Date().toISOString().replace(/[:.]/g, '-');
const retries = Number(process.env.PW_RETRIES);


module.exports = defineConfig({
  testDir: './tests',

  // 🔥 Disable parallel execution in container
  fullyParallel: false,
  
  // 🔥 Force single worker ALWAYS in deployment
  workers: 1,

  forbidOnly: !!process.env.CI,
  retries: Number.isNaN(retries) ? 2 : retries,
  timeout: 120000,
  globalTimeout: 300000,  

  outputDir: `artifacts/run-${runId}`,

  use: {
    headless: true,

    // 🔥 REQUIRED FOR RENDER
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ],
    },

    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  reporter: [
    ['html'],
    ['json', { outputFile: `artifacts/run-${runId}/result.json` }]
  ],

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});