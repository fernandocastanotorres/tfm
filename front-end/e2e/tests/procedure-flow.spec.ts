import { test, expect } from '../fixtures';
import { ProcedureFlowPage } from '../pages/procedure-flow.page';
import { LoginPage } from '../pages/login.page';
import {
  mockAuthState,
  mockProceduresResponse,
  mockProcedureLicenciaDetail,
  mockCreatedCaseItem,
  mockCaseDetailResponse,
  mockCaseStatusResponse,
} from '../fixtures';

test.describe('Procedure submission flow', () => {
  let procedureFlow: ProcedureFlowPage;
  let loginPage: LoginPage;

  test.beforeEach(({ page }) => {
    procedureFlow = new ProcedureFlowPage(page);
    loginPage = new LoginPage(page);
  });

  test('should browse the procedure catalog on /sede/procedimientos', async ({ page }) => {
    await page.route('**/api/v1/citizen/procedures/catalog', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProceduresResponse),
      });
    });

    await procedureFlow.navigateToProcedures();

    await expect(page).toHaveURL(/\/sede\/procedimientos/);
    await expect(page.locator('#procedures-title')).toBeVisible();

    const cardCount = await procedureFlow.getProcedureCardCount();
    expect(cardCount).toBe(mockProceduresResponse.length);
  });

  test('should redirect unauthenticated user to login when starting a procedure', async ({ page }) => {
    await page.route('**/api/v1/citizen/procedures/catalog/licencia-obra-menor', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProcedureLicenciaDetail),
      });
    });

    await procedureFlow.navigateToWizard('licencia-obra-menor');

    await expect(page).toHaveURL(/\/sede\/login/);
    await expect(loginPage.emailInput).toBeVisible();
  });

  test('should complete full procedure submission flow when authenticated', async ({ page }) => {
    await page.route('**/api/v1/**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      const method = route.request().method();

      // Procedure catalog list
      if (method === 'GET' && path === '/api/v1/citizen/procedures/catalog') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockProceduresResponse),
        });
      }

      // Procedure detail
      if (method === 'GET' && path.startsWith('/api/v1/citizen/procedures/catalog/')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockProcedureLicenciaDetail),
        });
      }

      // Create case
      if (method === 'POST' && path === '/api/v1/citizen/procedures') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCreatedCaseItem),
        });
      }

      // Upload document
      if (method === 'POST' && path.match(/\/api\/v1\/citizen\/procedures\/[^/]+\/documents$/)) {
        return route.fulfill({ status: 200 });
      }

      // Submit case
      if (method === 'POST' && path.endsWith('/submit')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCaseStatusResponse),
        });
      }

      // Case status polling
      if (method === 'GET' && path.endsWith('/status')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCaseStatusResponse),
        });
      }

      // List documents
      if (method === 'GET' && path.endsWith('/documents')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCaseDetailResponse.attachments),
        });
      }

      // Messages (must come before general case detail)
      if (path.includes('/messages')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ messages: [], page: 0, size: 20, totalItems: 0, totalPages: 1 }),
        });
      }

      // Download receipt
      if (method === 'GET' && path.endsWith('/receipt')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/pdf',
          body: Buffer.from('fake-receipt'),
        });
      }

      // Case detail
      if (method === 'GET' && path === '/api/v1/citizen/procedures/TEST-001') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCaseDetailResponse),
        });
      }

      // Case list with query params
      if (method === 'GET' && path === '/api/v1/citizen/procedures') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [mockCreatedCaseItem],
            totalItems: 1,
            totalPages: 1,
            currentPage: 0,
          }),
        });
      }

      // Unread count
      if (path.endsWith('/unread-count')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '0',
        });
      }

      // ENI download
      if (path.endsWith('/enidoc')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/octet-stream',
          body: Buffer.from('fake-eni'),
        });
      }

      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.context().addInitScript(() => {
      window.localStorage.setItem('auth_token', mockAuthState.token);
      window.localStorage.setItem('user_email', mockAuthState.email);
    });

    await procedureFlow.navigateToWizard('licencia-obra-menor');

    await expect(procedureFlow.wizardTitle).toBeVisible();
    await expect(page.locator('text=Datos del solicitante')).toBeVisible();

    await procedureFlow.fillFormField('subject', 'Obra menor para reforma de baño');
    await procedureFlow.fillFormField('description', 'Sustitución de sanitarios y alicatado');
    await procedureFlow.fillFormField('contactEmail', 'test@example.com');
    await procedureFlow.fillFormField('contactPhone', '600123456');

    await procedureFlow.clickNext();

    const isUpload = await procedureFlow.isCurrentStepUpload();
    expect(isUpload).toBe(true);
    await expect(page.locator('text=Documentación obligatoria')).toBeVisible();

    await procedureFlow.uploadDocument('doc-id', 'dni.pdf');
    await procedureFlow.uploadDocument('doc-supporting', 'memoria-obra.pdf');

    await procedureFlow.clickNext();

    const isReview = await procedureFlow.isCurrentStepReview();
    expect(isReview).toBe(true);

    await procedureFlow.clickSubmit();

    await expect(page).toHaveURL(/\/sede\/expedientes\/TEST-001\/detalle/);
    await expect(procedureFlow.wizardTitle).not.toBeVisible();
  });

  test('should show wizard navigation between steps', async ({ page }) => {
    await page.route('**/api/v1/citizen/procedures/catalog/licencia-obra-menor', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProcedureLicenciaDetail),
      });
    });

    await page.context().addInitScript(() => {
      window.localStorage.setItem('auth_token', mockAuthState.token);
      window.localStorage.setItem('user_email', mockAuthState.email);
    });

    await procedureFlow.navigateToWizard('licencia-obra-menor');

    await expect(procedureFlow.wizardTitle).toBeVisible();
    await expect(page.locator('text=Datos del solicitante')).toBeVisible();

    await expect(procedureFlow.backButton).toBeDisabled();
    await expect(procedureFlow.nextButton).toBeEnabled();

    await procedureFlow.fillFormField('subject', 'Test subject');
    await procedureFlow.fillFormField('description', 'Test description');
    await procedureFlow.fillFormField('contactEmail', 'test@example.com');
    await procedureFlow.fillFormField('contactPhone', '600123456');

    await procedureFlow.clickNext();

    await expect(page.locator('text=Documentación obligatoria')).toBeVisible();
    await expect(procedureFlow.backButton).toBeEnabled();

    await procedureFlow.clickBack();

    await expect(page.locator('text=Datos del solicitante')).toBeVisible();
  });
});
