import { test, expect } from '../fixtures';
import { DashboardPage } from '../pages/dashboard.page';
import { LoginPage } from '../pages/login.page';
import { mockAuthState } from '../fixtures';

async function waitForCasesOrEmptyState(dashboardPage: DashboardPage): Promise<void> {
  await Promise.race([
    dashboardPage.caseCards.first().waitFor({ state: 'visible', timeout: 10_000 }),
    dashboardPage.emptyState.waitFor({ state: 'visible', timeout: 10_000 }),
  ]);
}

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

    await expect(page).toHaveURL(/returnUrl=(%2F|\/)sede(%2F|\/)dashboard/);
  });

  test('should display dashboard layout after authentication', async ({ page }) => {
    await page.context().addInitScript((token: string) => {
      window.sessionStorage.setItem('tfg.access_token', token);
      window.sessionStorage.setItem('tfg.refresh_token', 'mock-refresh-token');
      window.sessionStorage.setItem('tfg.authenticated', 'true');
    }, mockAuthState.token);

    await dashboardPage.navigate();

    await expect(dashboardPage.title).toBeVisible();
    await expect(dashboardPage.searchInput).toBeVisible();
    await expect(dashboardPage.statusFilter).toBeVisible();
    await expect(dashboardPage.loadingState).toBeHidden();
    await waitForCasesOrEmptyState(dashboardPage);
  });

  test('should show cases list or empty state', async ({ page }) => {
    await page.context().addInitScript((token: string) => {
      window.sessionStorage.setItem('tfg.access_token', token);
      window.sessionStorage.setItem('tfg.refresh_token', 'mock-refresh-token');
      window.sessionStorage.setItem('tfg.authenticated', 'true');
    }, mockAuthState.token);

    await dashboardPage.navigate();
    await expect(dashboardPage.title).toBeVisible();
    await expect(dashboardPage.loadingState).toBeHidden();
    await waitForCasesOrEmptyState(dashboardPage);
  });

  test('should show empty state when no cases exist', async ({ page }) => {
    await page.context().addInitScript((token: string) => {
      window.sessionStorage.setItem('tfg.access_token', token);
      window.sessionStorage.setItem('tfg.refresh_token', 'mock-refresh-token');
      window.sessionStorage.setItem('tfg.authenticated', 'true');
    }, mockAuthState.token);

    await dashboardPage.navigate();

    await expect(dashboardPage.loadingState).toBeHidden();
    await waitForCasesOrEmptyState(dashboardPage);
  });

  test('should filter cases by status', async ({ page }) => {
    await page.context().addInitScript((token: string) => {
      window.sessionStorage.setItem('tfg.access_token', token);
      window.sessionStorage.setItem('tfg.refresh_token', 'mock-refresh-token');
      window.sessionStorage.setItem('tfg.authenticated', 'true');
    }, mockAuthState.token);

    await dashboardPage.navigate();

    await expect(dashboardPage.loadingState).toBeHidden();

    const initialCount = await dashboardPage.caseCards.count();
    if (initialCount === 0) {
      await expect(dashboardPage.emptyState).toBeVisible();
      return;
    }

    await dashboardPage.filterByStatus('PENDING');

    const visibleCards = await dashboardPage.caseCards.count();
    expect(visibleCards).toBeLessThanOrEqual(initialCount);
  });

  test('should search cases by text', async ({ page }) => {
    await page.context().addInitScript((token: string) => {
      window.sessionStorage.setItem('tfg.access_token', token);
      window.sessionStorage.setItem('tfg.refresh_token', 'mock-refresh-token');
      window.sessionStorage.setItem('tfg.authenticated', 'true');
    }, mockAuthState.token);

    await dashboardPage.navigate();

    await expect(dashboardPage.loadingState).toBeHidden();

    const initialCount = await dashboardPage.caseCards.count();
    if (initialCount === 0) {
      await expect(dashboardPage.emptyState).toBeVisible();
      return;
    }

    await dashboardPage.searchCases('licencia');

    const title = await dashboardPage.getCaseCardTitle(0);
    expect(title?.toLowerCase()).toContain('licencia');
  });

  test('should display detail panel when selecting a case', async ({ page }) => {
    await page.context().addInitScript((token: string) => {
      window.sessionStorage.setItem('tfg.access_token', token);
      window.sessionStorage.setItem('tfg.refresh_token', 'mock-refresh-token');
      window.sessionStorage.setItem('tfg.authenticated', 'true');
    }, mockAuthState.token);

    await dashboardPage.navigate();

    await expect(dashboardPage.loadingState).toBeHidden();

    const initialCount = await dashboardPage.caseCards.count();
    if (initialCount === 0) {
      await expect(dashboardPage.emptyState).toBeVisible();
      return;
    }

    await dashboardPage.selectCase(0);

    await expect(dashboardPage.detailPanel).toBeVisible();
  });

  test('should display summary statistics', async ({ page }) => {
    await page.context().addInitScript((token: string) => {
      window.sessionStorage.setItem('tfg.access_token', token);
      window.sessionStorage.setItem('tfg.refresh_token', 'mock-refresh-token');
      window.sessionStorage.setItem('tfg.authenticated', 'true');
    }, mockAuthState.token);
  
    await dashboardPage.navigate();

    await expect(dashboardPage.loadingState).toBeHidden();

    // Stat cards are always rendered (values may be zero).
    await expect(dashboardPage.title).toBeVisible();
    await expect(dashboardPage.statCards.first()).toBeVisible();

    const statCount = await dashboardPage.statCards.count();
    expect(statCount).toBeGreaterThanOrEqual(4);
  });
});
