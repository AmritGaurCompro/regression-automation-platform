const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.google.com/sorry/index?continue=https://www.google.com/search%3Fq%3Dgmail%26oq%3Dgmail%26gs_lcrp%3DEgZjaHJvbWUyBggAEEUYOdIBCDUzMjFqMGoyqAIAsAIB%26sourceid%3Dchrome%26ie%3DUTF-8%26sei%3DGxXmaf70Kdml5NoPhvuDmQg&q=EgSsrp2JGJuqmM8GIjCsvUWCVsnRC4hD5zjvlgakirTbVxc9G2qTINBVfrNWx204j7FuHks-0yLSCgEZURMyAVJaAUM');
  await page.locator('iframe[name="a-o6vrmrevsnoj"]').contentFrame().getByRole('checkbox', { name: 'I\'m not a robot' }).click();
  await page.locator('iframe[name="c-o6vrmrevsnoj"]').contentFrame().locator('[id="1"]').click();
  await page.locator('iframe[name="c-o6vrmrevsnoj"]').contentFrame().locator('[id="8"]').click();
  await page.locator('iframe[name="c-o6vrmrevsnoj"]').contentFrame().locator('[id="6"]').click();
  await page.locator('iframe[name="c-o6vrmrevsnoj"]').contentFrame().locator('[id="1"]').click();
  await page.locator('iframe[name="c-o6vrmrevsnoj"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  await page.locator('iframe[name="c-o6vrmrevsnoj"]').contentFrame().locator('[id="2"]').click();
  await page.locator('iframe[name="c-o6vrmrevsnoj"]').contentFrame().locator('[id="8"]').click();
  await page.locator('iframe[name="c-o6vrmrevsnoj"]').contentFrame().locator('[id="1"]').click();
  await page.locator('iframe[name="c-o6vrmrevsnoj"]').contentFrame().locator('[id="1"]').click();
  await page.locator('iframe[name="c-o6vrmrevsnoj"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  await page.goto('https://www.google.com/search?q=gmail&oq=gmail&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCDUzMjFqMGoyqAIAsAIB&sourceid=chrome&ie=UTF-8&sei=UxXmafPBHfXY5NoPrr2t8Ak');
  await page.getByRole('link', { name: 'Gmail Google https://www.' }).click();
  await page.getByRole('link', { name: 'Open the Google Gmail page' }).click();
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();