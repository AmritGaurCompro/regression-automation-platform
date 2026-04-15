const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.google.com/sorry/index?continue=https://www.google.com/search%3Fq%3Dyoutube%26oq%3Dyoutube%26gs_lcrp%3DEgZjaHJvbWUyBggAEEUYOdIBCDY1MDhqMGoyqAIAsAIB%26sourceid%3Dchrome%26ie%3DUTF-8%26sei%3DOzffaYiKFfav5NoPtPep6QM&q=EgSsrqUFGLvu_M4GIjAZYyKbvx2X4mK1EZcefPRuHIFl4m0xgdcMwaXZtUanb9dvGzc8dd9C5c_3oKyiuhkyAVJaAUM');
  await page.locator('iframe[name="a-nit9rhqsckc1"]').contentFrame().getByRole('checkbox', { name: 'I\'m not a robot' }).click();
  await page.locator('iframe[name="c-nit9rhqsckc1"]').contentFrame().locator('[id="1"]').click();
  await page.locator('iframe[name="c-nit9rhqsckc1"]').contentFrame().locator('[id="2"]').click();
  await page.locator('iframe[name="c-nit9rhqsckc1"]').contentFrame().locator('[id="4"]').click();
  await page.locator('iframe[name="c-nit9rhqsckc1"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();