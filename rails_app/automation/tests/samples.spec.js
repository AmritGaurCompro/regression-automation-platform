const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.google.com/sorry/index?continue=https://www.google.com/search%3Fq%3Dyoutube%26oq%3Dyoutube%26gs_lcrp%3DEgZjaHJvbWUyBggAEEUYOdIBCTEzMzQxajBqMqgCALACAQ%26sourceid%3Dchrome%26ie%3DUTF-8%26sei%3D5PzVaej0IKasmtkPtqrKqAE&q=EgSstuKFGOT5184GIjBegwDknLvLCwy6-4TgvCHIXfxTMR_JNqW05m71NNL4rv-1WHiWHe8Jol2qWl376GQyAVJaAUM');
  await page.locator('iframe[name="a-bz4b2crh08v6"]').contentFrame().getByRole('checkbox', { name: 'I\'m not a robot' }).click();
  await page.locator('iframe[name="c-bz4b2crh08v6"]').contentFrame().locator('[id="0"]').click();
  await page.locator('iframe[name="c-bz4b2crh08v6"]').contentFrame().locator('[id="1"]').click();
  await page.locator('iframe[name="c-bz4b2crh08v6"]').contentFrame().locator('[id="3"]').click();
  await page.locator('iframe[name="c-bz4b2crh08v6"]').contentFrame().locator('[id="1"]').click();
  await page.locator('iframe[name="c-bz4b2crh08v6"]').contentFrame().locator('[id="1"]').click();
  await page.locator('iframe[name="c-bz4b2crh08v6"]').contentFrame().locator('[id="1"]').click();
  await page.locator('iframe[name="c-bz4b2crh08v6"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  await page.locator('iframe[name="c-bz4b2crh08v6"]').contentFrame().locator('[id="8"]').click();
  await page.locator('iframe[name="c-bz4b2crh08v6"]').contentFrame().locator('[id="5"]').click();
  await page.locator('iframe[name="c-bz4b2crh08v6"]').contentFrame().locator('[id="7"]').click();
  await page.locator('iframe[name="c-bz4b2crh08v6"]').contentFrame().locator('[id="8"]').click();
  await page.locator('iframe[name="c-bz4b2crh08v6"]').contentFrame().locator('[id="5"]').click();
  await page.locator('iframe[name="c-bz4b2crh08v6"]').contentFrame().locator('[id="7"]').click();
  await page.locator('iframe[name="c-bz4b2crh08v6"]').contentFrame().locator('[id="8"]').click();
  await page.locator('iframe[name="c-bz4b2crh08v6"]').contentFrame().locator('[id="7"]').click();
  await page.locator('iframe[name="c-bz4b2crh08v6"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  await page.goto('https://www.google.com/search?q=youtube&oq=youtube&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCTEzMzQxajBqMqgCALACAQ&sourceid=chrome&ie=UTF-8&sei=Hf3VacaUDd2oqtsP8PWm0Aw');
  await page.getByRole('link', { name: 'YouTube YouTube https://www.' }).click();
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();