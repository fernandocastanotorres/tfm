import { Page, Locator } from '@playwright/test';

export class PasswordRecoveryPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly nationalIdInput: Locator;
  readonly sendCodeButton: Locator;
  readonly otpInput: Locator;
  readonly validateCodeButton: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly resetButton: Locator;
  readonly doneMessage: Locator;
  readonly errorMessage: Locator;
  readonly helperMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#recovery-email');
    this.nationalIdInput = page.locator('#recovery-national-id');
    this.sendCodeButton = page.locator('form:has(#recovery-email) button[type="submit"]');
    this.otpInput = page.locator('#otp');
    this.validateCodeButton = page.locator('form:has(#otp) button[type="submit"]');
    this.newPasswordInput = page.locator('#newPassword');
    this.confirmPasswordInput = page.locator('form:has(#newPassword) #confirmPassword');
    this.resetButton = page.locator('form:has(#newPassword) button[type="submit"]');
    this.doneMessage = page.locator('[role="status"]:has(h2)');
    this.errorMessage = page.locator('.error-text');
    this.helperMessage = page.locator('[role="status"].helper-text, .helper-text');
  }

  async navigate() {
    await this.page.goto('/sede/recuperacion');
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillNationalId(nationalId: string) {
    await this.nationalIdInput.fill(nationalId);
  }

  async submitRequest() {
    await this.sendCodeButton.click();
  }

  async fillOtp(otp: string) {
    await this.otpInput.fill(otp);
  }

  async submitOtp() {
    await this.validateCodeButton.click();
  }

  async fillNewPassword(password: string) {
    await this.newPasswordInput.fill(password);
  }

  async fillConfirmPassword(password: string) {
    await this.confirmPasswordInput.fill(password);
  }

  async submitReset() {
    await this.resetButton.click();
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }

  async getHelperMessage() {
    return this.helperMessage.textContent();
  }

  isDoneVisible() {
    return this.doneMessage.isVisible();
  }
}
