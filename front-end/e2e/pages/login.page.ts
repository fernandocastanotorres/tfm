import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorMessage: Locator;
  readonly infoMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
    this.registerLink = page.locator('a[href*="registro"]');
    this.forgotPasswordLink = page.locator('a[href*="recuperacion"]');
    this.errorMessage = page.locator('.error-text[role="alert"]');
    this.infoMessage = page.locator('[role="status"]');
  }

  async navigate() {
    await this.page.goto('/sede/login');
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async goToRegister() {
    await this.registerLink.click();
  }

  async goToForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }

  isSubmitButtonDisabled() {
    return this.submitButton.isDisabled();
  }
}
