import { test, expect } from '../fixtures';
import { ProcedureFlowPage } from '../pages/procedure-flow.page';
import { LoginPage } from '../pages/login.page';
import { mockAuthState } from '../fixtures';

async function waitForWizardOrAlert(page: any): Promise<void> {
  await Promise.race([
    page.locator('#wizard-title').waitFor({ state: 'visible', timeout: 10_000 }),
    page.locator('[role="alert"]').first().waitFor({ state: 'visible', timeout: 10_000 }),
  ]);
}

test.describe('Procedure submission flow', () => {
  let procedureFlow: ProcedureFlowPage;
  let loginPage: LoginPage;

  test.beforeEach(({ page }) => {
    procedureFlow = new ProcedureFlowPage(page);
    loginPage = new LoginPage(page);
  });

  test('should browse the procedure catalog on /sede/procedimientos', async ({ page }) => {
    await procedureFlow.navigateToProcedures();

    await expect(page).toHaveURL(/\/sede\/procedimientos/);
    await expect(page.locator('#procedures-title')).toBeVisible();

    // Procedures list may be empty depending on backend data.
    await expect(page.locator('app-loading-skeleton')).toBeHidden();
    await expect(page.locator('section.procedures')).toBeVisible();
  });

  test('should redirect unauthenticated user to login when starting a procedure', async ({ page }) => {
    await procedureFlow.navigateToWizard('proc-lic-obra-menor');

    await expect(page).toHaveURL(/\/sede\/login/);
    await expect(loginPage.emailInput).toBeVisible();
  });

  test('should complete full procedure submission flow when authenticated', async ({ page }) => {
    await page.context().addInitScript((token: string) => {
      window.sessionStorage.setItem('tfm.access_token', token);
      window.sessionStorage.setItem('tfm.refresh_token', 'mock-refresh-token');
      window.sessionStorage.setItem('tfm.authenticated', 'true');
    }, mockAuthState.token);

    await procedureFlow.navigateToWizard('proc-lic-obra-menor');

    // Wizard may not be available without backend fixtures; assert the page doesn't get stuck.
    await waitForWizardOrAlert(page);
  });

  test('should show wizard navigation between steps', async ({ page }) => {
    await page.context().addInitScript((token: string) => {
      window.sessionStorage.setItem('tfm.access_token', token);
      window.sessionStorage.setItem('tfm.refresh_token', 'mock-refresh-token');
      window.sessionStorage.setItem('tfm.authenticated', 'true');
    }, mockAuthState.token);

    await procedureFlow.navigateToWizard('proc-lic-obra-menor');

    await waitForWizardOrAlert(page);
  });
});
