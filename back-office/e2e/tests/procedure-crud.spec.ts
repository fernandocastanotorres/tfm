import { test, expect } from '../fixtures';
import { ProcedureManagementPage, BackofficeLoginPage } from '../pages/procedure-management.page';

test.describe('Procedure Management E2E', () => {
  let procedurePage: ProcedureManagementPage;
  let loginPage: BackofficeLoginPage;

  test.beforeEach(async ({ page }) => {
    procedurePage = new ProcedureManagementPage(page);
    loginPage = new BackofficeLoginPage(page);
  });

  test('should display procedure management page', async ({ page }) => {
    await page.goto('/admin/procedures');

    await expect(page.locator('h3:has-text("Gestion de Procedimientos")')).toBeVisible();
    await expect(page.locator('button:has-text("Nuevo procedimiento")')).toBeVisible();
  });

  test('should open create procedure modal', async ({ page }) => {
    await page.goto('/admin/procedures');

    await procedurePage.openNewProcedure();

    await expect(procedurePage.modalTitle).toBeVisible();
    await expect(procedurePage.modalTitle).toContainText('Nuevo procedimiento');
  });

  test('should create procedure with form task and fields', async ({ page }) => {
    await page.goto('/admin/procedures');

    await procedurePage.openNewProcedure();

    // Fill basic info
    const titleInput = page.locator('input[(ngModel)]').first();
    await titleInput.fill('Licencia de Obra Menor');

    await page.selectOption('select#category-select', 'Urbanismo');
    await page.selectOption('select#unit-select', 'Urbanismo');

    // Add a FORM task
    await page.locator('button:has-text("Anadir tarea")').click();
    const taskSelect = page.locator('select').nth(2);
    await taskSelect.selectOption('FORM');

    // Expand task and add fields
    await page.locator('button:has-text("Expandir")').first().click();
    await page.waitForTimeout(100);

    await page.locator('button:has-text("+ Anadir campo")').click();
    await page.waitForTimeout(100);

    const firstFieldLabel = page.locator('.border.rounded.p-2.bg-gray-50 input').first();
    await firstFieldLabel.fill('Nombre completo');

    // Save
    await page.locator('button:has-text("Guardar")').click();

    // Verify success (should close modal and show procedure in list)
    await expect(procedurePage.modalTitle).not.toBeVisible();
  });

  test('should create procedure with multiple form tasks', async ({ page }) => {
    await page.goto('/admin/procedures');

    await procedurePage.openNewProcedure();

    // Fill basic info
    const titleInput = page.locator('input[(ngModel)]').first();
    await titleInput.fill('Solicitud de Certificados');

    await page.selectOption('select#category-select', 'Administración');
    await page.selectOption('select#unit-select', 'Secretaría');

    // Add Task 1 - FORM
    await page.locator('button:has-text("Anadir tarea")').click();
    const task1Select = page.locator('select').nth(2);
    await task1Select.selectOption('FORM');
    await page.locator('button:has-text("Expandir")').first().click();
    await page.waitForTimeout(100);
    await page.locator('button:has-text("+ Anadir campo")').click();
    await page.waitForTimeout(100);
    await page.locator('.border.rounded.p-2.bg-gray-50 input').first().fill('DNI');
    const task1IdInput = page.locator('.border.rounded.p-2.bg-gray-50 input').nth(1);
    await task1IdInput.fill('dni');

    // Add Task 2 - FORM
    await page.locator('button:has-text("Anadir tarea")').click();
    const task2Select = page.locator('select').nth(3);
    await task2Select.selectOption('FORM');

    // Add Task 3 - REVIEW
    await page.locator('button:has-text("Anadir tarea")').click();
    const task3Select = page.locator('select').nth(4);
    await task3Select.selectOption('REVIEW');

    // Save
    await page.locator('button:has-text("Guardar")').click();

    // Verify modal closed
    await expect(procedurePage.modalTitle).not.toBeVisible();
  });

  test('should use category and unit selects', async ({ page }) => {
    await page.goto('/admin/procedures');

    await procedurePage.openNewProcedure();

    // Verify selects have options
    const categorySelect = page.locator('select#category-select');
    await expect(categorySelect).toBeVisible();

    const options = await categorySelect.locator('option').allTextContents();
    expect(options).toContain('Urbanismo');
    expect(options).toContain('Padrón');
    expect(options).toContain('+ Otra...');

    // Select a category
    await page.selectOption('select#category-select', 'Urbanismo');

    // Select a unit
    const unitSelect = page.locator('select#unit-select');
    await expect(unitSelect).toBeVisible();
    await page.selectOption('select#unit-select', 'Secretaría');

    // Verify values are set (form should have these values)
    await expect(categorySelect).toHaveValue('Urbanismo');
    await expect(unitSelect).toHaveValue('Secretaría');
  });

  test('should allow custom category via "Otra..." option', async ({ page }) => {
    await page.goto('/admin/procedures');

    await procedurePage.openNewProcedure();

    // Select "Otra..." from category
    await page.selectOption('select#category-select', '__custom__');

    // Custom input should appear
    const customInput = page.locator('input#category-custom');
    await expect(customInput).toBeVisible();

    // Fill custom category
    await customInput.fill('Mi categoría custom');

    // Fill other required fields
    await page.locator('input[(ngModel)]').first().fill('Test Procedure');
    await page.selectOption('select#unit-select', 'Secretaría');

    // Save
    await page.locator('button:has-text("Guardar")').click();

    // Verify modal closed
    await expect(procedurePage.modalTitle).not.toBeVisible();
  });

  test('should validate required fields before save', async ({ page }) => {
    await page.goto('/admin/procedures');

    await procedurePage.openNewProcedure();

    // Try to save without required fields
    await page.locator('button:has-text("Guardar")').click();

    // Modal should still be visible (save should not proceed without required fields)
    await expect(procedurePage.modalTitle).toBeVisible();
  });

  test('should cancel procedure creation', async ({ page }) => {
    await page.goto('/admin/procedures');

    await procedurePage.openNewProcedure();

    // Fill some data
    await page.locator('input[(ngModel)]').first().fill('Test Procedure');
    await page.selectOption('select#category-select', 'Urbanismo');

    // Cancel
    await page.locator('button:has-text("Cancelar")').click();

    // Modal should close
    await expect(procedurePage.modalTitle).not.toBeVisible();
  });

  test('should add and remove tasks', async ({ page }) => {
    await page.goto('/admin/procedures');

    await procedurePage.openNewProcedure();

    // Add first task
    await page.locator('button:has-text("Anadir tarea")').click();
    const task1 = page.locator('div.border.rounded-md.p-3').first();
    await expect(task1).toBeVisible();

    // Add second task
    await page.locator('button:has-text("Anadir tarea")').click();
    const task2 = page.locator('div.border.rounded-md.p-3').nth(1);
    await expect(task2).toBeVisible();

    // Remove first task
    await page.locator('button:has-text("Eliminar tarea")').first().click();

    // Confirm dialog if present
    const dialog = page.locator('.swal2-container');
    if (await dialog.isVisible()) {
      await page.locator('button:has-text("Si, eliminar")').click();
    }

    await page.waitForTimeout(100);
  });
});