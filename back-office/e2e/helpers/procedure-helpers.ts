import { test, expect, Page, BrowserContext } from '@playwright/test';

function generateAuthToken(email: string = 'admin@test.com'): string {
  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    email,
    preferred_username: email,
    roles: ['ROLE_ADMIN'],
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const enc = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${enc(header)}.${enc(payload)}.`;
}

export async function setupAuth(context: BrowserContext): Promise<void> {
  const token = generateAuthToken();
  await context.addInitScript((t: string) => {
    window.sessionStorage.setItem('bo_access_token', t);
    window.sessionStorage.setItem('bo_user_profile', JSON.stringify({
      id: 'user-1',
      email: 'admin@test.com',
      roles: ['ROLE_ADMIN']
    }));
  }, token);
}

export async function openProcedureModal(page: Page): Promise<void> {
  await page.goto('/admin/procedures');
  await page.waitForTimeout(2000);
  await page.locator('button:has-text("Nuevo procedimiento")').click();
  await page.waitForTimeout(1000);
}

export async function fillBasicProcedureInfo(page: Page, title: string): Promise<void> {
  await page.locator('input').first().fill(title);
  await page.selectOption('select#category-select', 'Urbanismo');
  await page.waitForTimeout(300);
  await page.selectOption('select#unit-select', 'Secretaría');
}

export async function addFormTask(page: Page): Promise<void> {
  await page.locator('button:has-text("Anadir tarea")').click();
  await page.waitForTimeout(500);
  await page.locator('select').nth(3).selectOption('FORM');
}

export async function expandTaskIfNeeded(page: Page): Promise<void> {
  const expandButton = page.locator('button:has-text("Expandir")').first();
  if (await expandButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await expandButton.click();
    await page.waitForTimeout(200);
  }
}

export async function collapseTask(page: Page): Promise<void> {
  const hideButton = page.locator('button:has-text("Ocultar")').first();
  if (await hideButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await hideButton.click();
    await page.waitForTimeout(200);
  }
}

export async function addFieldToTask(page: Page, label: string): Promise<void> {
  await page.locator('button:has-text("+ Anadir campo")').click();
  await page.waitForTimeout(200);
  await page.locator('.border.rounded.p-2.bg-gray-50 input').first().fill(label);
}

export async function selectLocale(page: Page, locale: string): Promise<void> {
  await page.locator(`button:has-text("${locale}")`).click();
  await page.waitForTimeout(300);
}

export async function fillTranslationTitle(page: Page, title: string): Promise<void> {
  const translationTitle = page.locator('#translation-title');
  const isVisible = await translationTitle.isVisible({ timeout: 2000 }).catch(() => false);
  if (isVisible) {
    await translationTitle.fill(title);
  } else {
    console.log('Translation title input not visible, skipping');
  }
}

export async function fillTranslationDescription(page: Page, description: string): Promise<void> {
  await page.locator('textarea').last().fill(description);
}

export async function fillTaskTranslation(page: Page, title: string): Promise<void> {
  const taskTitleInput = page.locator('input[placeholder="Titulo de tarea"]').first();
  const isVisible = await taskTitleInput.isVisible({ timeout: 2000 }).catch(() => false);
  if (isVisible) {
    await taskTitleInput.fill(title);
  } else {
    console.log('Task translation input not visible, skipping');
  }
}

export async function saveProcedure(page: Page): Promise<void> {
  await page.locator('button:has-text("Guardar")').click();
  await page.waitForTimeout(3000);
  
  const errorMessages = await page.locator('.text-red-600, [class*="error"], .bg-red-100').allTextContents();
  if (errorMessages.length > 0) {
    console.log('Error messages found:', errorMessages);
  }
}

export async function cancelProcedure(page: Page): Promise<void> {
  await page.locator('button:has-text("Cancelar")').click();
}

export async function expectModalClosed(page: Page): Promise<void> {
  await expect(page.locator('#procedure-modal-title')).not.toBeVisible({ timeout: 5000 });
}

export async function expectProcedureInList(page: Page, title: string): Promise<void> {
  const procedureCard = page.locator(`.bg-white.rounded-lg.shadow.p-6:has-text("${title}")`);
  await expect(procedureCard).toBeVisible({ timeout: 5000 });
}

export async function editProcedure(page: Page, title: string): Promise<void> {
  const procedureCard = page.locator(`.bg-white.rounded-lg.shadow.p-6:has-text("${title}")`);
  await procedureCard.locator('button:has-text("Editar")').click();
  await page.locator('#procedure-modal-title').waitFor({ state: 'visible' });
}