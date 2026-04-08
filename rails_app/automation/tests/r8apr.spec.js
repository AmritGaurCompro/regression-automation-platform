import { test, expect } from '@playwright/test';

test('r8apr', async ({ page }) => {
  await page.goto('https://www.google.com/');
  await page.getByRole('combobox', { name: 'Search' }).click();
  await page.close();
});
