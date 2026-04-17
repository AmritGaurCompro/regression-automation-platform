const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.google.com/sorry/index?continue=https://www.google.com/search%3Fq%3Dgmail%26oq%3Dgmail%26gs_lcrp%3DEgZjaHJvbWUyBggAEEUYOdIBCDM2MzdqMGoyqAIAsAIB%26sourceid%3Dchrome%26ie%3DUTF-8%26sei%3Dphbiad7hB6ujqtsPudS86Q0&q=EgSs19DDGKatiM8GIjCU7AvKBJ1kAJBHTcRPQCdGADP0mdqg1m3E5Ejf_LqnI3fvyO3faC6jlg0rwg8IShUyAVJaAUM');
  await page.locator('iframe[name="a-cu8wds17zumh"]').contentFrame().getByRole('checkbox', { name: 'I\'m not a robot' }).click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="0"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="1"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="5"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="4"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="8"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="9"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="13"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="12"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().getByRole('button', { name: 'Next' }).click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="5"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="6"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="10"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="14"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="9"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="11"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().getByRole('button', { name: 'Next' }).click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="5"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="6"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="10"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="14"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="9"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="11"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="13"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().getByRole('button', { name: 'Next' }).click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="10"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().locator('[id="14"]').click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().getByRole('button', { name: 'Next' }).click();
  await page.locator('iframe[name="c-cu8wds17zumh"]').contentFrame().getByRole('button', { name: 'Skip' }).click();
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();