import { test, expect } from '../fixtures';
import { CaseDetailPage, MessagesPage } from '../pages/procedure-flow.page';
import {
  mockAuthState,
  mockCaseDetailResponse,
  mockCaseStatusResponse,
  mockMessageThreadsResponse,
  mockMessagesPagedResponse,
  mockSentMessageResponse,
} from '../fixtures';

test.describe('Citizen case detail and messages', () => {
  let caseDetail: CaseDetailPage;
  let messagesPage: MessagesPage;

  test.beforeEach(({ page }) => {
    caseDetail = new CaseDetailPage(page);
    messagesPage = new MessagesPage(page);
  });

  test('should display case detail with timeline and attachments', async ({ page }) => {
    await page.route('**/api/v1/**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      const method = route.request().method();

      if (method === 'GET' && path === '/api/v1/citizen/procedures/TEST-001/documents') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCaseDetailResponse.attachments),
        });
      }

      if (method === 'GET' && path.endsWith('/status')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCaseStatusResponse),
        });
      }

      if (method === 'GET' && path.endsWith('/receipt')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/pdf',
          body: Buffer.from('fake-receipt'),
        });
      }

      if (method === 'GET' && path === '/api/v1/citizen/procedures/TEST-001/messages') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockMessagesPagedResponse),
        });
      }

      if (method === 'GET' && path === '/api/v1/citizen/procedures/TEST-001') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCaseDetailResponse),
        });
      }

      if (path.endsWith('/unread-count')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '0',
        });
      }

      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.context().addInitScript(() => {
      window.localStorage.setItem('auth_token', mockAuthState.token);
      window.localStorage.setItem('user_email', mockAuthState.email);
    });

    await caseDetail.navigateTo('TEST-001');

    await expect(caseDetail.title).toBeVisible();
    await expect(caseDetail.title).toContainText('licencia de obra menor');

    expect(await caseDetail.getAttachmentCount()).toBeGreaterThanOrEqual(1);

    const timelineCount = await caseDetail.getTimelineEventCount();
    expect(timelineCount).toBeGreaterThanOrEqual(2);
  });

  test('should send a message from the case detail page', async ({ page }) => {
    let capturedMessageContent = '';

    await page.route('**/api/v1/**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      const method = route.request().method();

      if (method === 'POST' && path === '/api/v1/citizen/procedures/TEST-001/messages') {
        const formData = await route.request().postData();
        const contentMatch = formData?.match(/content=([^&]+)/);
        capturedMessageContent = contentMatch ? decodeURIComponent(contentMatch[1]) : '';
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockSentMessageResponse),
        });
      }

      if (method === 'GET' && path === '/api/v1/citizen/procedures/TEST-001/documents') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCaseDetailResponse.attachments),
        });
      }

      if (method === 'GET' && path.endsWith('/status')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCaseStatusResponse),
        });
      }

      if (method === 'GET' && path === '/api/v1/citizen/procedures/TEST-001/messages') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockMessagesPagedResponse,
            messages: [
              ...mockMessagesPagedResponse.messages,
              ...(capturedMessageContent ? [mockSentMessageResponse] : []),
            ],
          }),
        });
      }

      if (method === 'GET' && path === '/api/v1/citizen/procedures/TEST-001') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCaseDetailResponse),
        });
      }

      if (path.endsWith('/receipt')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/pdf',
          body: Buffer.from('fake-receipt'),
        });
      }

      if (path.endsWith('/unread-count')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '0',
        });
      }

      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.context().addInitScript(() => {
      window.localStorage.setItem('auth_token', mockAuthState.token);
      window.localStorage.setItem('user_email', mockAuthState.email);
    });

    await caseDetail.navigateTo('TEST-001');
    await caseDetail.isLoaded();

    const initialMessageCount = await caseDetail.getMessageCount();

    const messageText = 'He revisado la notificación, gracias.';
    await page.locator('#case-reply').fill(messageText);
    await page.locator('div:has(> #case-reply) button[type="button"]').click();

    await expect(caseDetail.messageBubbles.first()).toBeVisible({ timeout: 5000 });

    const finalMessageCount = await caseDetail.getMessageCount();
    expect(capturedMessageContent).toBe(messageText);
    expect(finalMessageCount).toBeGreaterThanOrEqual(initialMessageCount);
  });

  test('should display message thread on secure messaging page', async ({ page }) => {
    await page.route('**/api/v1/**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      const method = route.request().method();

      if (method === 'GET' && path === '/api/v1/citizen/messages/threads') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockMessageThreadsResponse),
        });
      }

      if (method === 'GET' && path === '/api/v1/citizen/procedures/TEST-001/messages') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockMessagesPagedResponse),
        });
      }

      if (path.endsWith('/unread-count')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '0',
        });
      }

      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.context().addInitScript(() => {
      window.localStorage.setItem('auth_token', mockAuthState.token);
      window.localStorage.setItem('user_email', mockAuthState.email);
    });

    await messagesPage.navigateTo();
    await expect(page).toHaveURL(/\/sede\/mensajes/);

    const threadCount = await messagesPage.threadHeaders.count();
    expect(threadCount).toBeGreaterThanOrEqual(1);

    await messagesPage.expandThread(0);
    await expect(messagesPage.messageBubbles.first()).toBeVisible({ timeout: 5000 });

    const lastMessage = await messagesPage.getLastMessageText();
    expect(lastMessage).toContain('Urbanismo');
  });
});
