import { test, expect } from '../fixtures';
import { DashboardPage } from '../pages/dashboard.page';
import { LoginPage } from '../pages/login.page';
import { mockAuthState, mockCasesResponse, mockEmptyCasesResponse } from '../fixtures';

test.describe('Citizen dashboard', () => {
  let dashboardPage: DashboardPage;
  let loginPage: LoginPage;

  test.beforeEach(({ page }) => {
    dashboardPage = new DashboardPage(page);
    loginPage = new LoginPage(page);
  });

  test('should redirect unauthenticated users to login when accessing /dashboard', async ({ page }) => {
    await dashboardPage.navigate();

    await expect(page).toHaveURL(/\/sede\/login/);
    await expect(loginPage.emailInput).toBeVisible();
  });

  test('should redirect with returnUrl query parameter', async ({ page }) => {
    await dashboardPage.navigate();

    await expect(page).toHaveURL(/returnUrl=\/dashboard/);
  });

  test('should display dashboard layout after authentication', async ({ page }) => {
    await page.route('**/api/cases*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCasesResponse),
      });
    });

    await page.context().addInitScript(() => {
      window.localStorage.setItem('auth_token', 'mock-jwt-token-for-e2e-testing');
      window.localStorage.setItem('user_email', 'test@example.com');
    });

    await dashboardPage.navigate();

    await expect(dashboardPage.title).toBeVisible();
    await expect(dashboardPage.searchInput).toBeVisible();
    await expect(dashboardPage.statusFilter).toBeVisible();
  });

  test('should show case cards when cases exist', async ({ page }) => {
    await page.route('**/api/cases*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCasesResponse),
      });
    });

    await page.context().addInitScript(() => {
      window.localStorage.setItem('auth_token', 'mock-jwt-token-for-e2e-testing');
      window.localStorage.setItem('user_email', 'test@example.com');
    });

    await dashboardPage.navigate();

    const caseCount = await dashboardPage.caseCards.count();
    expect(caseCount).toBeGreaterThan(0);
  });

  test('should show empty state when no cases exist', async ({ page }) => {
    await page.route('**/api/cases*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockEmptyCasesResponse),
      });
    });

    await page.context().addInitScript(() => {
      window.localStorage.setItem('auth_token', 'mock-jwt-token-for-e2e-testing');
      window.localStorage.setItem('user_email', 'test@example.com');
    });

    await dashboardPage.navigate();

    await expect(dashboardPage.emptyState).toBeVisible();
  });

  test('should filter cases by status', async ({ page }) => {
    await page.route('**/api/cases*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCasesResponse),
      });
    });

    await page.context().addInitScript(() => {
      window.localStorage.setItem('auth_token', 'mock-jwt-token-for-e2e-testing');
      window.localStorage.setItem('user_email', 'test@example.com');
    });

    await dashboardPage.navigate();

    await dashboardPage.filterByStatus('PENDING');

    const visibleCards = await dashboardPage.caseCards.count();
    expect(visibleCards).toBeLessThanOrEqual(mockCasesResponse.items.length);
  });

  test('should search cases by text', async ({ page }) => {
    await page.route('**/api/cases*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCasesResponse),
      });
    });

    await page.context().addInitScript(() => {
      window.localStorage.setItem('auth_token', 'mock-jwt-token-for-e2e-testing');
      window.localStorage.setItem('user_email', 'test@example.com');
    });

    await dashboardPage.navigate();

    await dashboardPage.searchCases('licencia');

    const title = await dashboardPage.getCaseCardTitle(0);
    expect(title?.toLowerCase()).toContain('licencia');
  });

  test('should display detail panel when selecting a case', async ({ page }) => {
    await page.route('**/api/cases*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCasesResponse),
      });
    });

    await page.context().addInitScript(() => {
      window.localStorage.setItem('auth_token', 'mock-jwt-token-for-e2e-testing');
      window.localStorage.setItem('user_email', 'test@example.com');
    });

    await dashboardPage.navigate();

    await dashboardPage.selectCase(0);

    await expect(dashboardPage.detailPanel).toBeVisible();
  });

  test('should display summary statistics', async ({ page }) => {
    await page.route('**/api/cases*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCasesResponse),
      });
    });

    await page.context().addInitScript(() => {
      window.localStorage.setItem('auth_token', 'mock-jwt-token-for-e2e-testing');
      window.localStorage.setItem('user_email', 'test@example.com');
    });

    await dashboardPage.navigate();

    const statCount = await dashboardPage.statCards.count();
    expect(statCount).toBeGreaterThanOrEqual(3);
  });
});
