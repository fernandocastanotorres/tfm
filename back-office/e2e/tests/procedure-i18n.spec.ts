import { test, expect, Page } from '@playwright/test';

function generateAuthToken(email: string = 'admin@test.com'): string {
  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    email,
    preferred_username: email,
    roles: ['ROLE_ADMIN'],
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const enc = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${enc(header)}.${enc(payload)}.`;
}

async function setupAuth(page: Page): Promise<void> {
  const token = generateAuthToken();
  await page.context().addInitScript((t: string) => {
    window.sessionStorage.setItem('bo_access_token', t);
    window.sessionStorage.setItem('bo_user_profile', JSON.stringify({
      id: 'user-1',
      email: 'admin@test.com',
      roles: ['ROLE_ADMIN']
    }));
  }, token);
}

test.describe('Procedure i18n UI Validation', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should open new procedure modal and fill basic info', async ({ page }) => {
    await page.goto('/admin/procedures');
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Nuevo procedimiento")').click();
    await page.waitForTimeout(1000);

    await expect(page.locator('#procedure-modal-title')).toBeVisible();
    await expect(page.locator('#procedure-modal-title')).toContainText('Nuevo procedimiento');

    await page.locator('input').first().fill('Test Procedure');
    await page.waitForTimeout(200);

    await page.selectOption('select#category-select', 'Urbanismo');
    await page.waitForTimeout(300);

    await page.selectOption('select#unit-select', 'Secretaría');
    await page.waitForTimeout(300);

    const titleValue = await page.locator('input').first().inputValue();
    expect(titleValue).toBe('Test Procedure');
  });

  test('should switch between locale tabs', async ({ page }) => {
    await page.goto('/admin/procedures');
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Nuevo procedimiento")').click();
    await page.waitForTimeout(1000);

    await page.locator('input').first().fill('Procedure Test');
    await page.selectOption('select#category-select', 'Urbanismo');
    await page.waitForTimeout(300);
    await page.selectOption('select#unit-select', 'Secretaría');

    const localeButtons = ['es-ES', 'ca-ES', 'eu-ES', 'gl-ES', 'va-ES'];
    for (const locale of localeButtons) {
      await page.locator(`button:has-text("${locale}")`).click();
      await page.waitForTimeout(200);
      const isActive = await page.locator(`button:has-text("${locale}")`).getAttribute('class');
      expect(isActive).toContain('font-medium');
    }
  });

  test('should fill catalan translation fields', async ({ page }) => {
    await page.goto('/admin/procedures');
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Nuevo procedimiento")').click();
    await page.waitForTimeout(1000);

    await page.locator('input').first().fill('Procedure Test');
    await page.selectOption('select#category-select', 'Urbanismo');
    await page.waitForTimeout(300);
    await page.selectOption('select#unit-select', 'Secretaría');

    await page.locator('button:has-text("ca-ES")').click();
    await page.waitForTimeout(300);

    await page.locator('#translation-title').fill('Procediment Test Catalan');
    await page.waitForTimeout(200);

    await page.locator('textarea').last().fill('Descripcio en catala');
    await page.waitForTimeout(200);

    const translationTitle = await page.locator('#translation-title').inputValue();
    expect(translationTitle).toBe('Procediment Test Catalan');
  });

  test('should fill galician translation fields', async ({ page }) => {
    await page.goto('/admin/procedures');
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Nuevo procedimiento")').click();
    await page.waitForTimeout(1000);

    await page.locator('input').first().fill('Procedure Test GL');
    await page.selectOption('select#category-select', 'Administración');
    await page.waitForTimeout(300);
    await page.selectOption('select#unit-select', 'Secretaría');

    await page.locator('button:has-text("gl-ES")').click();
    await page.waitForTimeout(300);

    await page.locator('#translation-title').fill('Procedemento Test Galego');
    await page.waitForTimeout(200);

    const translationTitle = await page.locator('#translation-title').inputValue();
    expect(translationTitle).toBe('Procedemento Test Galego');
  });

  test('should add task and fill task title', async ({ page }) => {
    await page.goto('/admin/procedures');
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Nuevo procedimiento")').click();
    await page.waitForTimeout(1000);

    await page.locator('input').first().fill('Procedure with Task');
    await page.selectOption('select#category-select', 'Urbanismo');
    await page.waitForTimeout(300);
    await page.selectOption('select#unit-select', 'Secretaría');

    await page.locator('button:has-text("Anadir tarea")').click();
    await page.waitForTimeout(500);

    await page.locator('select').nth(3).selectOption('FORM');
    await page.waitForTimeout(500);

    const expandBtn = page.locator('button:has-text("Expandir")').first();
    if (await expandBtn.isVisible()) {
      await expandBtn.click();
      await page.waitForTimeout(200);
    }

    await page.locator('input[placeholder="Titulo"]').first().fill('Datos del solicitante');
    await page.waitForTimeout(200);

    const taskTitle = await page.locator('input[placeholder="Titulo"]').first().inputValue();
    expect(taskTitle).toBe('Datos del solicitante');
  });

  test('should fill task translation for catalan locale', async ({ page }) => {
    await page.goto('/admin/procedures');
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Nuevo procedimiento")').click();
    await page.waitForTimeout(1000);

    await page.locator('input').first().fill('Procedure with Task Translation');
    await page.selectOption('select#category-select', 'Urbanismo');
    await page.waitForTimeout(300);
    await page.selectOption('select#unit-select', 'Secretaría');

    await page.locator('button:has-text("Anadir tarea")').click();
    await page.waitForTimeout(500);

    await page.locator('select').nth(3).selectOption('FORM');
    await page.waitForTimeout(500);

    const expandBtn = page.locator('button:has-text("Expandir")').first();
    if (await expandBtn.isVisible()) {
      await expandBtn.click();
      await page.waitForTimeout(200);
    }

    await page.locator('input[placeholder="Titulo"]').first().fill('Datos del solicitante');

    await page.locator('button:has-text("ca-ES")').click();
    await page.waitForTimeout(300);

    const taskTranslations = page.locator('input[placeholder="Titulo de tarea"]');
    if (await taskTranslations.first().isVisible()) {
      await taskTranslations.first().fill('Dades del sol·licitant');
      const taskTitleValue = await taskTranslations.first().inputValue();
      expect(taskTitleValue).toBe('Dades del sol·licitant');
    }
  });

  test('should validate cancel button closes modal', async ({ page }) => {
    await page.goto('/admin/procedures');
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Nuevo procedimiento")').click();
    await page.waitForTimeout(1000);

    await page.locator('input').first().fill('Procedure to Cancel');
    await page.selectOption('select#category-select', 'Urbanismo');

    await page.locator('button:has-text("Cancelar")').click();
    await page.waitForTimeout(500);

    await expect(page.locator('#procedure-modal-title')).not.toBeVisible();
  });

  test('should show all supported locales', async ({ page }) => {
    await page.goto('/admin/procedures');
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Nuevo procedimiento")').click();
    await page.waitForTimeout(1000);

    const locales = ['es-ES', 'ca-ES', 'eu-ES', 'gl-ES', 'va-ES'];
    for (const locale of locales) {
      const localeButton = page.locator(`button:has-text("${locale}")`);
      await expect(localeButton).toBeVisible();
    }
  });
});