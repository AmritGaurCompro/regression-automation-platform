const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.google.com/sorry/index?continue=https://www.google.com/search%3Fq%3Dfb%26oq%3Dfb%26gs_lcrp%3DEgZjaHJvbWUyBggAEEUYOdIBCDUxMTRqMGoyqAIAsAIB%26sourceid%3Dchrome%26ie%3DUTF-8%26sei%3DutHEaajEEsauptQP2ej1oAY&q=EgRA7I7iGLqjk84GIjAc72V74W8R-GV3FdnYFcPP9Lbms61DlJsjCiUCtt_nnlxbq5B1Awz45HZ6GH7F4VQyAVJaAUM');
  await page.locator('iframe[name="a-c69ad6pllm9l"]').contentFrame().getByRole('checkbox', { name: 'I\'m not a robot' }).click();
  await page.locator('iframe[name="c-c69ad6pllm9l"]').contentFrame().locator('[id="3"]').click();
  await page.locator('iframe[name="c-c69ad6pllm9l"]').contentFrame().locator('[id="2"]').click();
  await page.locator('iframe[name="c-c69ad6pllm9l"]').contentFrame().locator('[id="4"]').click();
  await page.locator('iframe[name="c-c69ad6pllm9l"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  const page1 = await context.newPage();
  await page.close();
  await page1.goto('https://www.google.com/sorry/index?continue=https://www.google.com/search%3Fq%3Dgmail%26oq%3Dgmail%26gs_lcrp%3DEgZjaHJvbWUyBggAEEUYOdIBCDI4ODNqMGoxqAIAsAIB%26sourceid%3Dchrome%26ie%3DUTF-8%26sei%3D1NHEaf37IMGtw8cPk6P_0AU&q=EgRA7I7iGNSjk84GIjD8fRqleFaniAuYzA-NJ84S9oJUW87Y1mF89iIDsAZsl1ekbDTljD5JhETvpTz7-W0yAVJaAUM');
  await page1.locator('iframe[name="a-wnthd2unotcx"]').contentFrame().getByRole('checkbox', { name: 'I\'m not a robot' }).click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="1"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="3"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="7"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="1"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="3"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="3"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="9"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="8"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="5"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="10"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="14"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="13"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="12"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="4"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="6"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().getByRole('button', { name: 'Next' }).click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="8"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="8"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="12"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="13"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="9"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().locator('[id="8"]').click();
  await page1.locator('iframe[name="c-wnthd2unotcx"]').contentFrame().getByRole('button', { name: 'Next' }).click();
  await page1.close();

  // ---------------------
  await context.close();
  await browser.close();
})();