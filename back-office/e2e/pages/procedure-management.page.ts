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

  async openTranslationsSection() {
    const translationsTab = this.page.locator('button:has-text("Traducciones")');
    await translationsTab.waitFor({ state: 'visible' });
    await translationsTab.click();
    await this.page.waitForTimeout(200);
  }

  async addProcedureTranslation(locale: string, title: string, description: string) {
    await this.page.locator('button:has-text("+ Nueva traduccion")').click();
    await this.page.waitForTimeout(100);
    
    const localeInput = this.page.locator('select#locale-select, select[class*="locale"]').last();
    await localeInput.selectOption(locale);
    
    const titleInput = this.page.locator('input[placeholder*="titulo"], input[class*="title"]').last();
    await titleInput.fill(title);
    
    const descInput = this.page.locator('textarea[class*="description"], textarea').last();
    await descInput.fill(description);
  }

  async getTranslationLocales(): Promise<string[]> {
    const localeSelectors = this.page.locator('select#locale-select, select[class*="locale"]');
    const count = await localeSelectors.count();
    const locales: string[] = [];
    for (let i = 0; i < count; i++) {
      const value = await localeSelectors.nth(i).inputValue();
      if (value) locales.push(value);
    }
    return locales;
  }

  async openTaskTranslations(taskIndex: number) {
    const taskCard = this.page.locator('div.border.rounded-md.p-3').nth(taskIndex);
    const translateBtn = taskCard.locator('button:has-text("Traducciones tarea")');
    await translateBtn.click();
    await this.page.waitForTimeout(200);
  }

  async addTaskTranslation(taskIndex: number, locale: string, title: string, description: string) {
    await this.page.locator(`button:has-text("+ Traduccion tarea")`).click();
    await this.page.waitForTimeout(100);
    
    const localeInput = this.page.locator('select#task-locale-select, select[class*="task-locale"]').last();
    await localeInput.selectOption(locale);
    
    const titleInput = this.page.locator('input[placeholder*="titulo tarea"], input[class*="task-title"]').last();
    await titleInput.fill(title);
    
    const descInput = this.page.locator('textarea[class*="task-description"], textarea').last();
    await descInput.fill(description);
  }

  async openFieldTranslations(taskIndex: number, fieldIndex: number) {
    await this.expandTask(taskIndex);
    await this.page.waitForTimeout(100);
    
    const taskCard = this.page.locator('div.border.rounded-md.p-3').nth(taskIndex);
    const fieldCard = taskCard.locator('div.border.rounded.p-2.bg-gray-50').nth(fieldIndex);
    const translateBtn = fieldCard.locator('button:has-text("Traducciones campo")');
    await translateBtn.click();
    await this.page.waitForTimeout(200);
  }

  async addFieldTranslation(fieldIndex: number, locale: string, label: string) {
    await this.page.locator('button:has-text("+ Traduccion")').click();
    await this.page.waitForTimeout(100);
    
    const localeInput = this.page.locator('select#field-locale-select, select[class*="field-locale"]').last();
    await localeInput.selectOption(locale);
    
    const labelInput = this.page.locator('input[placeholder*="etiqueta"], input[class*="field-label"]').last();
    await labelInput.fill(label);
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