import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.vhlcentral.com/');
  await page.getByRole('textbox', { name: 'Username or Email' }).click();
  await page.getByRole('textbox', { name: 'Username or Email' }).fill('mtaparia_instructor');
  await page.getByText('Password', { exact: true }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('@Compro2018');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByLabel('Phonics Essentials').getByRole('link', { name: 'My Dashboard' }).click();
});