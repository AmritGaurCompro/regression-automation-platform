const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.google.com/sorry/index?continue=https://www.google.com/search%3Fq%3Dgmail%26oq%3Dgmail%26gs_lcrp%3DEgZjaHJvbWUyBggAEEUYOdIBCDYxNzJqMGoyqAIAsAIB%26sourceid%3Dchrome%26ie%3DUTF-8%26sei%3DGRLiaafuNeDZ5NoP1KKxwQ8&q=EgQ0s12AGJqkiM8GIjAmBAoy2-D7-n1TZ7b2BpGp507QT-lY2wwakmuCbCVSwPxi2YPjWSH7Jyp0cN6siDEyAVJaAUM');
  await page.locator('iframe[name="a-l32d05welh9q"]').contentFrame().getByRole('checkbox', { name: 'I\'m not a robot' }).click();
  await page.locator('iframe[name="c-l32d05welh9q"]').contentFrame().locator('[id="4"]').click();
  await page.locator('iframe[name="c-l32d05welh9q"]').contentFrame().locator('[id="6"]').click();
  await page.locator('iframe[name="c-l32d05welh9q"]').contentFrame().locator('[id="5"]').click();
  await page.locator('iframe[name="c-l32d05welh9q"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  await page.locator('iframe[name="c-l32d05welh9q"]').contentFrame().locator('[id="6"]').click();
  await page.locator('iframe[name="c-l32d05welh9q"]').contentFrame().locator('[id="5"]').click();
  await page.locator('iframe[name="c-l32d05welh9q"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  await page.locator('iframe[name="c-l32d05welh9q"]').contentFrame().locator('[id="6"]').click();
  await page.locator('iframe[name="c-l32d05welh9q"]').contentFrame().locator('[id="2"]').click();
  await page.locator('iframe[name="c-l32d05welh9q"]').contentFrame().locator('[id="1"]').click();
  await page.locator('iframe[name="c-l32d05welh9q"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  await page.locator('iframe[name="c-l32d05welh9q"]').contentFrame().locator('[id="6"]').click();
  await page.locator('iframe[name="c-l32d05welh9q"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  await page.goto('https://www.google.com/search?q=gmail&oq=gmail&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCDYxNzJqMGoyqAIAsAIB&sourceid=chrome&ie=UTF-8&sei=QxLiae3DA_ar5NoP-9PA0Ak');
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();