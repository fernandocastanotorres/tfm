import { Page, Locator } from '@playwright/test';

export class ProcedureFlowPage {
  readonly page: Page;

  readonly loadingState: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly submitButton: Locator;
  readonly wizardTitle: Locator;
  readonly stepLabel: Locator;
  readonly reviewSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loadingState = page.locator('[role="status"]');
    this.nextButton = page.locator('button:has-text("Siguiente"), button:has-text("Next")');
    this.backButton = page.locator('button:has-text("Anterior"), button:has-text("Back")');
    this.submitButton = page.locator('button:has-text("Enviar"), button:has-text("Submit")');
    this.wizardTitle = page.locator('#wizard-title');
    this.stepLabel = page.locator('.text-sm.text-surface-600').first();
    this.reviewSection = page.locator('section.card.p-6').last();
  }

  async navigateToProcedures() {
    await this.page.goto('/sede/procedimientos');
  }

  async navigateToWizard(procedureId: string) {
    await this.page.goto(`/sede/expedientes/nuevo/${procedureId}`);
  }

  async navigateToCaseDetail(caseId: string) {
    await this.page.goto(`/sede/expedientes/${caseId}/detalle`);
  }

  async navigateToMessages() {
    await this.page.goto('/sede/mensajes');
  }

  async clickStartProcedure(index: number) {
    await this.page.locator('.card.p-6 .btn-primary').nth(index).click();
  }

  async clickSeeAllProcedures() {
    await this.page.locator('a[href*="procedimientos"]').last().click();
  }

  async getProcedureCardCount() {
    return this.page.locator('article.card.p-6').count();
  }

  async getProcedureCardName(index: number) {
    return this.page.locator('article.card.p-6 h2').nth(index).textContent();
  }

  async fillFormField(fieldId: string, value: string) {
    await this.page.locator(`#${fieldId}`).fill(value);
  }

  async uploadDocument(requirementId: string, fileName: string) {
    const fileInput = this.page.locator(`#file-input-${requirementId}`);
    await fileInput.setInputFiles({
      name: fileName,
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content'),
    });
  }

  async getUploadedFileList(requirementId: string) {
    return this.page.locator(`#dropzone-${requirementId}`).locator('..').locator('ul li');
  }

  async clickNext() {
    await this.nextButton.click();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async clickSubmit() {
    await this.submitButton.click();
  }

  async getReviewFormEntries() {
    return this.page.locator('.rounded-xl.bg-surface-100.p-4.text-sm .grid').allTextContents();
  }

  async isCurrentStepUpload() {
    const count = await this.page.locator('.wizard-dropzone').count();
    return count > 0;
  }

  async isCurrentStepReview() {
    return this.reviewSection.isVisible();
  }
}

export class CaseDetailPage {
  readonly page: Page;
  readonly title: Locator;
  readonly caseId: Locator;
  readonly statusBadge: Locator;
  readonly description: Locator;
  readonly timeline: Locator;
  readonly attachments: Locator;
  readonly messageTextarea: Locator;
  readonly sendMessageButton: Locator;
  readonly messageBubbles: Locator;
  readonly loadingState: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('#case-title');
    this.caseId = page.locator('p.text-surface-600').first();
    this.statusBadge = page.locator('span.inline-flex.w-fit');
    this.description = page.locator('.card.p-6 p.text-surface-600').first();
    this.timeline = page.locator('ol.space-y-4');
    this.attachments = page.locator('ul.space-y-3 li');
    this.messageTextarea = page.locator('#case-reply');
    this.sendMessageButton = page.locator('button:has-text("Enviar mensaje"), button:has-text("Reply")');
    this.messageBubbles = page.locator('.message-bubble');
    this.loadingState = page.locator('[role="status"]');
    this.continueButton = page.locator('button:has-text("Continuar"), button:has-text("Continue")');
  }

  async navigateTo(caseId: string) {
    await this.page.goto(`/sede/expedientes/${caseId}/detalle`);
  }

  async isLoaded() {
    await this.title.waitFor({ state: 'visible', timeout: 5000 });
  }

  async sendMessage(text: string) {
    await this.messageTextarea.fill(text);
    await this.page.locator('button.btn-primary[type="button"]').filter({ hasText: /Enviar|Send/ }).click();
  }

  async getMessageCount() {
    return this.messageBubbles.count();
  }

  async getLastMessageText() {
    const count = await this.messageBubbles.count();
    if (count === 0) return '';
    return this.messageBubbles.nth(count - 1).locator('.message-bubble__content').textContent();
  }

  async getAttachmentCount() {
    return this.attachments.count();
  }

  async getTimelineEventCount() {
    return this.timeline.locator('li').count();
  }
}

export class MessagesPage {
  readonly page: Page;
  readonly title: Locator;
  readonly threadHeaders: Locator;
  readonly messageBubbles: Locator;
  readonly replyTextarea: Locator;
  readonly sendButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('#messages-title');
    this.threadHeaders = page.locator('.message-thread__header');
    this.messageBubbles = page.locator('.message-bubble');
    this.replyTextarea = page.locator('textarea[id^="reply-"]');
    this.sendButton = page.locator('.message-thread__reply-actions button.btn-primary');
  }

  async navigateTo() {
    await this.page.goto('/sede/mensajes');
  }

  async expandThread(index: number) {
    await this.threadHeaders.nth(index).click();
  }

  async sendReply(text: string) {
    await this.replyTextarea.fill(text);
    await this.sendButton.click();
  }

  async getMessageCount() {
    return this.messageBubbles.count();
  }

  async getLastMessageText() {
    const count = await this.messageBubbles.count();
    if (count === 0) return '';
    return this.messageBubbles.nth(count - 1).locator('.message-bubble__content').textContent();
  }
}
