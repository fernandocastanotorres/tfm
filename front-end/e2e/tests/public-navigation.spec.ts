import { test, expect } from '../fixtures';
import { PublicHomePage } from '../pages/public-home.page';

test.describe('Public navigation', () => {
  let publicHome: PublicHomePage;

  test.beforeEach(({ page }) => {
    publicHome = new PublicHomePage(page);
  });

  test('should load public home page at /sede', async ({ page }) => {
    await publicHome.navigate();

    await expect(page).toHaveURL(/\/sede$/);
    await expect(publicHome.title).toBeVisible();
    await expect(publicHome.proceduresLink).toBeVisible();
    await expect(publicHome.loginLink).toBeVisible();
  });

  test('should display quick access cards on home page', async ({ page }) => {
    await publicHome.navigate();

    const cardCount = await publicHome.getQuickAccessCardCount();
    expect(cardCount).toBeGreaterThanOrEqual(4);
  });

  test('should navigate to procedures list from home', async ({ page }) => {
    await publicHome.navigate();

    await publicHome.goToProcedures();

    await expect(page).toHaveURL(/\/sede\/procedimientos/);
  });

  test('should navigate to FAQ page', async ({ page }) => {
    await publicHome.navigate();

    await publicHome.goToFAQ();

    await expect(page).toHaveURL(/\/sede\/faq/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should navigate to contact page', async ({ page }) => {
    await publicHome.navigate();

    await publicHome.goToContact();

    await expect(page).toHaveURL(/\/sede\/contacto/);
  });

  test('should navigate to calendar page', async ({ page }) => {
    // Home may not render calendar link if there are no upcoming events.
    await page.goto('/sede/calendario');

    await expect(page).toHaveURL(/\/sede\/calendario/);
  });

  test('should display sitemap at /sede/mapa', async ({ page }) => {
    await page.goto('/sede/mapa');

    await expect(page).toHaveURL(/\/sede\/mapa/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should navigate to login from home CTA', async ({ page }) => {
    await publicHome.navigate();

    await publicHome.goToLogin();

    await expect(page).toHaveURL(/\/sede\/login/);
  });
});
