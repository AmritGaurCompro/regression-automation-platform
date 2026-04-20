const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.google.com/sorry/index?continue=https://www.google.com/search%3Fq%3Dgmail%26oq%3Dgmail%26gs_lcrp%3DEgZjaHJvbWUyBggAEEUYOdIBCDUyODJqMGoyqAIAsAIB%26sourceid%3Dchrome%26ie%3DUTF-8%26sei%3Dj-blacLFIc2kiLMPibjdyQc&q=EgSsrHdhGI_Nl88GIjD0R1L6ZelnTJFCjBnfdV5qePLlA4HTDyBcsoccXx5tvsk9PaYBpCeSYAHQhnhH3IIyAVJaAUM');
  await page.locator('iframe[name="a-jiuom527an1t"]').contentFrame().getByRole('checkbox', { name: 'I\'m not a robot' }).click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="5"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="6"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="10"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="9"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="13"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="14"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().getByRole('button', { name: 'Next' }).click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="6"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="7"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="11"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="10"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="9"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="5"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="13"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="14"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().getByRole('button', { name: 'Next' }).click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="4"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="8"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="9"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="10"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="6"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().getByRole('button', { name: 'Next' }).click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="2"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="6"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="10"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="9"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().getByRole('button', { name: 'Next' }).click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="5"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="6"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="7"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="11"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="10"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="9"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="1"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="4"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="0"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="0"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().locator('[id="0"]').click();
  await page.locator('iframe[name="c-jiuom527an1t"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  await page.goto('https://www.google.com/search?q=gmail&oq=gmail&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCDUyODJqMGoyqAIAsAIB&sourceid=chrome&ie=UTF-8&sei=3Obladj9E-us5NoPqMaiyAY');
  await page.getByRole('link', { name: 'Gmail Gmail https://www.' }).click();
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();