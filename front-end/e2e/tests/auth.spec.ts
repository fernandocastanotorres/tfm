import { test, expect } from '../fixtures';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { PasswordRecoveryPage } from '../pages/password-recovery.page';

test.describe('Authentication flows', () => {
  let loginPage: LoginPage;
  let registerPage: RegisterPage;
  let recoveryPage: PasswordRecoveryPage;

  test.beforeEach(({ page }) => {
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
    recoveryPage = new PasswordRecoveryPage(page);
  });

  test('should display login form on /sede/login', async ({ page }) => {
    await loginPage.navigate();

    await expect(page).toHaveURL(/\/sede\/login/);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.submitButton).toBeDisabled();
  });

  test('should show validation errors for empty credentials', async ({ page }) => {
    await loginPage.navigate();

    await loginPage.submit();

    const emailError = page.locator('#email-error');
    const passwordError = page.locator('#password-error');

    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    await loginPage.navigate();

    await loginPage.fillEmail('not-an-email');
    await loginPage.fillPassword('Password123!');
    await loginPage.submit();

    const emailError = page.locator('#email-error');
    await expect(emailError).toBeVisible();
  });

  test('should navigate to register from login page', async ({ page }) => {
    await loginPage.navigate();

    await loginPage.goToRegister();

    await expect(page).toHaveURL(/\/sede\/registro/);
  });

  test('should display registration form on /sede/registro', async ({ page }) => {
    await registerPage.navigate();

    await expect(page).toHaveURL(/\/sede\/registro/);
    await expect(registerPage.fullNameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.nationalIdInput).toBeVisible();
    await expect(registerPage.phoneInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.termsCheckbox).toBeVisible();
    await expect(registerPage.submitButton).toBeVisible();
  });

  test('should show validation errors for invalid email in registration', async ({ page }) => {
    await registerPage.navigate();

    await registerPage.fillEmail('invalid-email');
    await registerPage.fillFullName('Test User');
    await registerPage.fillNationalId('12345678A');
    await registerPage.fillPhone('600123123');
    await registerPage.fillPassword('Pass1234!');
    await registerPage.fillConfirmPassword('Pass1234!');
    await registerPage.acceptTerms();
    await registerPage.submit();

    const emailError = page.locator('#email').locator('xpath=..').locator('.error-text');
    await expect(emailError).toBeVisible();
  });

  test('should navigate to password recovery from login', async ({ page }) => {
    await loginPage.navigate();

    await loginPage.goToForgotPassword();

    await expect(page).toHaveURL(/\/sede\/recuperacion/);
  });

  test('should display password recovery form on /sede/recuperacion', async ({ page }) => {
    await recoveryPage.navigate();

    await expect(page).toHaveURL(/\/sede\/recuperacion/);
    await expect(recoveryPage.emailInput).toBeVisible();
    await expect(recoveryPage.nationalIdInput).toBeVisible();
    await expect(recoveryPage.sendCodeButton).toBeVisible();
  });

  test('should show validation errors for empty recovery form', async ({ page }) => {
    await recoveryPage.navigate();

    await recoveryPage.submitRequest();

    const emailField = page.locator('#recovery-email');
    const nationalIdField = page.locator('#recovery-national-id');

    await expect(emailField).toHaveAttribute('aria-invalid', 'true');
    await expect(nationalIdField).toHaveAttribute('aria-invalid', 'true');
  });

  test('should advance to OTP step after submitting valid recovery form', async ({ page }) => {
    await recoveryPage.navigate();

    await recoveryPage.fillEmail('test@example.com');
    await recoveryPage.fillNationalId('12345678A');
    await recoveryPage.submitRequest();

    const otpInput = page.locator('#otp');
    await expect(otpInput).toBeVisible();
  });
});
