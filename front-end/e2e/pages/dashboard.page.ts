import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly title: Locator;
  readonly caseCards: Locator;
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly pageSizeSelect: Locator;
  readonly clearFiltersButton: Locator;
  readonly previousPageButton: Locator;
  readonly nextPageButton: Locator;
  readonly paginationInfo: Locator;
  readonly emptyState: Locator;
  readonly loadingState: Locator;
  readonly errorState: Locator;
  readonly detailPanel: Locator;
  readonly statCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('#dashboard-title');
    this.caseCards = page.locator('button[aria-pressed]');
    this.searchInput = page.locator('#case-search');
    this.statusFilter = page.locator('#case-status');
    this.pageSizeSelect = page.locator('#case-page-size');
    this.clearFiltersButton = page.locator('button:has-text("Clear"), button:has-text("Limpiar")');
    this.previousPageButton = page.locator('button:has-text("Previous"), button:has-text("Anterior")');
    this.nextPageButton = page.locator('button:has-text("Next"), button:has-text("Siguiente")');
    this.paginationInfo = page.locator('.text-sm.text-surface-600');
    this.emptyState = page.locator('.card.p-6.text-surface-600');
    // Loading block contains the skeleton component.
    this.loadingState = page.locator('app-loading-skeleton');
    this.errorState = page.locator('.card.p-6.text-center.text-red-600');
    this.detailPanel = page.locator('aside.card.p-6');
    this.statCards = page.locator('.card.p-4');
  }

  async navigate() {
    await this.page.goto('/sede/dashboard');
  }

  async searchCases(query: string) {
    await this.searchInput.fill(query);
  }

  async filterByStatus(status: string) {
    await this.statusFilter.selectOption(status);
  }

  async clearFilters() {
    await this.clearFiltersButton.click();
  }

  async goToNextPage() {
    await this.nextPageButton.click();
  }

  async goToPreviousPage() {
    await this.previousPageButton.click();
  }

  async selectCase(index: number) {
    await this.caseCards.nth(index).click();
  }

  getCaseCard(index: number) {
    return this.caseCards.nth(index);
  }

  async getCaseCardTitle(index: number) {
    return this.caseCards.nth(index).locator('h3').textContent();
  }

  async getCaseCardStatus(index: number) {
    return this.caseCards.nth(index).locator('span.px-3').textContent();
  }

  isEmptyStateVisible() {
    return this.emptyState.isVisible();
  }

  isLoadingVisible() {
    return this.loadingState.isVisible();
  }

  isErrorVisible() {
    return this.errorState.isVisible();
  }

  isDetailPanelVisible() {
    return this.detailPanel.isVisible();
  }
}
