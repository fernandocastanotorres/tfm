import { Page, Locator } from '@playwright/test';

export class PublicHomePage {
  readonly page: Page;
  readonly title: Locator;
  readonly proceduresLink: Locator;
  readonly loginLink: Locator;
  readonly quickAccessCards: Locator;
  readonly faqCard: Locator;
  readonly contactCard: Locator;
  readonly seeAllProceduresLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('#home-title');
    // Use the hero CTAs to avoid hidden nav links (responsive menus).
    this.proceduresLink = page.locator('.public-home__hero-actions a[href*="/sede/procedimientos"]').first();
    this.loginLink = page.locator('.public-home__hero-actions a[href*="/sede/login"]').first();
    this.quickAccessCards = page.locator('.public-home__quick-card');
    // Quick cards are anchors themselves (no nested <a>).
    this.faqCard = page.locator('.public-home__quick-card[href*="/sede/faq"]').first();
    this.contactCard = page.locator('.public-home__quick-card[href*="/sede/contacto"]').first();
    this.seeAllProceduresLink = page.locator('a[href*="procedimientos"]').last();
  }

  async navigate() {
    await this.page.goto('/sede');
  }

  async goToProcedures() {
    await this.proceduresLink.click();
  }

  async goToLogin() {
    await this.loginLink.click();
  }

  async goToFAQ() {
    await this.faqCard.click();
  }

  async goToContact() {
    await this.contactCard.click();
  }

  async goToSeeAllProcedures() {
    await this.seeAllProceduresLink.click();
  }

  getQuickAccessCards() {
    return this.quickAccessCards;
  }

  async getQuickAccessCardCount() {
    return this.quickAccessCards.count();
  }
}
