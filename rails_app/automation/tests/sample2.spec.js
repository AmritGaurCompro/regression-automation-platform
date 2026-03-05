const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://ap.meraki.com/');
  const page1 = await context.newPage();
  await page.close();
  await page1.goto('https://www.instagram.com/');
  await page1.close();

  // ---------------------
  await context.close();
  await browser.close();
})();