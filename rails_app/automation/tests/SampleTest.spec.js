const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.google.com/sorry/index?continue=https://www.google.com/search%3Fq%3Dyoutube%26oq%3Dyoutube%26gs_lcrp%3DEgZjaHJvbWUyBggAEEUYOdIBCDU0NTVqMGoyqAIAsAIB%26sourceid%3Dchrome%26ie%3DUTF-8%26sei%3D8NrhacfFCMOHptQPnpWdkAI&q=EgSExF4jGPC1h88GIjCejDfU5TjFsn_aJiDtRIEWFcCpancK19ZtLcR9DNjg-30bdvYbi3gagjyofPj4stEyAVJaAUM');
  await page.locator('iframe[name="a-fqa0yo2ej4bj"]').contentFrame().getByRole('checkbox', { name: 'I\'m not a robot' }).click();
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();