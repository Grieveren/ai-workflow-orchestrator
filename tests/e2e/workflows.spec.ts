import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
const apiUrl = process.env.API_URL ?? 'http://localhost:3001';

test.describe('Developer handoff workflow', () => {
  test.beforeEach(async ({ request }) => {
    await request.patch(`${apiUrl}/api/requests/REQ-002`, {
      data: {
        stage: 'Ready for Dev',
        owner: 'Sarah Chen',
        lastUpdate: 'Reset via Playwright test',
        activity: []
      }
    });
  });

  test.afterEach(async ({ request }) => {
    await request.patch(`${apiUrl}/api/requests/REQ-002`, {
      data: {
        stage: 'Ready for Dev',
        owner: 'Sarah Chen',
        lastUpdate: 'Reset after Playwright test',
        activity: []
      }
    });
  });

  test('developer can accept a request and move it to In Progress', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard`);
    await page.getByRole('button', { name: 'Developer' }).click();

    const requestCell = page.getByRole('cell', { name: 'REQ-002' }).first();
    await expect(requestCell).toBeVisible();
    await requestCell.click();

    await expect(page).toHaveURL(/\/request\/REQ-002$/);
    await expect(page.getByRole('heading', { level: 2, name: 'REQ-002' })).toBeVisible();

    const acceptButton = page.getByRole('button', { name: /Accept & Start Work/i });
    await expect(acceptButton).toBeVisible();
    await acceptButton.click();

    const inProgressBadge = page.locator('span', { hasText: 'In Progress' }).first();
    await expect(inProgressBadge).toBeVisible();
  });
});

test.describe('Analytics dashboard', () => {
  test('shows portfolio metrics sourced from live data', async ({ page }) => {
    await page.goto(`${baseUrl}/analytics`);

    await expect(page.getByRole('heading', { name: /Portfolio Analytics/i })).toBeVisible();

    const funnelSection = page.locator('div', { hasText: 'Request Flow' }).first();
    await expect(funnelSection).toContainText(/Intake/i);
    await expect(funnelSection).toContainText(/Scoping/i);
    await expect(funnelSection).toContainText(/Completed/i);

    const completionCard = page.locator('div', { hasText: 'Average completion time' }).first();
    await expect(completionCard).toContainText(/\d/);

    const activeAgeCard = page.locator('div', { hasText: 'Average active age' }).first();
    await expect(activeAgeCard).toContainText(/\d/);

    const completionRateCard = page.locator('div', { hasText: 'Completed vs total' }).first();
    await expect(completionRateCard).toContainText(/\d/);

    const slaCard = page.locator('div', { hasText: 'SLA Adherence' }).first();
    await expect(slaCard).toContainText(/\d/);
  });
});
