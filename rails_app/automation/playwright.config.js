const { defineConfig, devices } = require('@playwright/test');

const runId = new Date().toISOString().replace(/[:.]/g, '-');
const retries = Number(process.env.PW_RETRIES);

module.exports = defineConfig({
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: Number.isNaN(retries) ? 2 : retries,
  workers: process.env.CI ? 1 : undefined,

  outputDir: `artifacts/run-${runId}`,

  use: {
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