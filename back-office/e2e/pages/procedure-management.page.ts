import { Page, Locator } from '@playwright/test';

export class ProcedureManagementPage {
  readonly page: Page;
  readonly newButton: Locator;
  readonly searchInput: Locator;
  readonly procedureCards: Locator;
  readonly modalTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newButton = page.locator('button:has-text("Nuevo procedimiento")');
    this.searchInput = page.locator('input[placeholder="Buscar procedimiento"]');
    this.procedureCards = page.locator('.bg-white.rounded-lg.shadow').first();
    this.modalTitle = page.locator('#procedure-modal-title');
  }

  async navigate() {
    await this.page.goto('/admin/procedures');
  }

  async openNewProcedure() {
    await this.newButton.click();
    await this.modalTitle.waitFor({ state: 'visible' });
  }

  async fillBasicInfo(title: string, category: string, unit: string) {
    await this.page.locator('input[(ngModel)]').first().fill(title);
    await this.page.selectOption('select#category-select', category);
    await this.page.selectOption('select#unit-select', unit);
  }

  async addTask(type: string = 'FORM') {
    await this.page.locator('button:has-text("Anadir tarea")').click();
    await this.page.waitForTimeout(100);
    const taskSelect = this.page.locator('select').last();
    await taskSelect.selectOption(type);
  }

  async expandTask(index: number) {
    await this.page.locator('button:has-text("Expandir")').nth(index).click();
  }

  async addFieldToTask(taskIndex: number, label: string) {
    await this.expandTask(taskIndex);
    await this.page.locator('button:has-text("+ Anadir campo")').click();
    const fields = this.page.locator('.border.rounded.p-2.bg-gray-50');
    const lastField = fields.last();
    await lastField.locator('input').first().fill(label);
  }

  async saveProcedure() {
    await this.page.locator('button:has-text("Guardar")').click();
  }

  async cancel() {
    await this.page.locator('button:has-text("Cancelar")').click();
  }

  async getProcedureCount(): Promise<number> {
    return this.page.locator('.bg-white.rounded-lg.shadow.p-6').count();
  }
}

export class BackofficeLoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async navigate() {
    await this.page.goto('/admin/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}