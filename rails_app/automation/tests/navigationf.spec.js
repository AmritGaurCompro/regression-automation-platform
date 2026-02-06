import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.vhlcentral.com/');
  await page.getByRole('textbox', { name: 'Username or Email' }).click();
  await page.getByRole('textbox', { name: 'Username or Email' }).fill('mtaparia_instructor');
  await page.locator('music-text-field-v3').filter({ hasText: 'Password' }).click();
  await page.locator('music-text-field-v3').filter({ hasText: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('@compro2018');
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByLabel('BRIDGES California E').getByRole('link', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Grades' }).click();
  await page.locator('#main-menubar').getByText('Assignments', { exact: true }).click();
});