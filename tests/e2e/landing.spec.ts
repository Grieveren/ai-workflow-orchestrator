import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

test.describe('Landing page smoke', () => {
  test('shows requester hero and nav', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page.getByRole('heading', { name: /what can we do for you today/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /view my requests/i })).toBeVisible();
  });

  test('product owner can access request detail workflow', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard`);
    await page.getByRole('button', { name: 'Product Owner' }).click();
    await page.getByRole('cell', { name: 'REQ-003' }).first().click();
    await expect(page).toHaveURL(/\/request\/REQ-003$/);
    await expect(page.getByRole('heading', { level: 2, name: 'REQ-003' })).toBeVisible();
    const modeHeading = page.getByRole('heading', { level: 3, name: /Generate Requirements Documents/i });
    if (await modeHeading.count()) {
      await expect(modeHeading).toBeVisible();
      await expect(page.getByRole('radio', { name: /Guided Mode/i })).toBeVisible();
    } else {
      await expect(page.getByRole('button', { name: 'BRD', exact: true })).toBeVisible();
    }
  });
});
