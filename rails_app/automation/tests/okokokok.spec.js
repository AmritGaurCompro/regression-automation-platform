const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.google.com/');
  await page.getByRole('link', { name: 'Gmail' }).click();
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();