import { Page, Locator } from '@playwright/test';

export class PublicHomePage {
  readonly page: Page;
  readonly title: Locator;
  readonly proceduresLink: Locator;
  readonly loginLink: Locator;
  readonly quickAccessCards: Locator;
  readonly faqCard: Locator;
  readonly contactCard: Locator;
  readonly calendarLink: Locator;
  readonly seeAllProceduresLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('#home-title');
    this.proceduresLink = page.locator('a[href*="procedimientos"]').first();
    this.loginLink = page.locator('a[href*="login"]');
    this.quickAccessCards = page.locator('.public-home__quick-card');
    this.faqCard = page.locator('a[href*="faq"]');
    this.contactCard = page.locator('a[href*="contacto"]');
    this.calendarLink = page.locator('a[href*="calendario"]');
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

  async goToCalendar() {
    await this.calendarLink.click();
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
