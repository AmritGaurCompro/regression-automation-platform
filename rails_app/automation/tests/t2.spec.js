import { test, expect } from '@playwright/test';

test('t2', async ({ page }) => {
  await page.goto('https://www.youtube.com/');
  await page.getByRole('combobox', { name: 'Search' }).click();
});
