import { test as base, Page } from '@playwright/test';
import type { Fixtures } from '@playwright/test';

export interface AdminAuthState {
  token: string;
  email: string;
}

type CustomFixtures = {
  adminAuthState: AdminAuthState | null;
  adminPage: Page;
};

export const test = base.extend<CustomFixtures>({
  adminAuthState: [null, { option: true }],

  adminPage: async ({ page, adminAuthState }, use) => {
    if (adminAuthState) {
      await page.context().addInitScript(
        (state: AdminAuthState) => {
          window.sessionStorage.setItem('tfg.access_token', state.token);
          window.sessionStorage.setItem('tfg.refresh_token', 'mock-refresh-token');
          window.sessionStorage.setItem('tfg.authenticated', 'true');
          window.sessionStorage.setItem('tfg.role', 'ROLE_ADMIN');
        },
        adminAuthState,
      );
    }

    await use(page);
  },
});

export const expect = test.expect;

function createMockJwt(email: string, role: string = 'ROLE_ADMIN'): string {
  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    email,
    preferred_username: email,
    roles: [role],
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };
  const enc = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString('base64');
  return `${enc(header)}.${enc(payload)}.`;
}

export const mockAdminAuthState: AdminAuthState = {
  token: createMockJwt('admin@test.com', 'ROLE_ADMIN'),
  email: 'admin@test.com',
};

export const mockCategoriesResponse = [
  'Urbanismo', 'Padrón', 'Administración', 'Medio Ambiente', 'Tráfico', 'Sanidad', 'Servicios Sociales', 'General'
];

export const mockUnitsResponse = [
  'Secretaría', 'Tesorería', 'Registro', 'Urbanismo', 'Personal', 'Vía Pública', 'Contratación'
];

export const mockProcedureCreatedResponse = {
  id: 'proc-new-001',
  title: 'Nuevo Procedimiento Test',
  description: 'Descripción del procedimiento de prueba',
  category: 'Urbanismo',
  status: 'DRAFT',
  assignedUnit: 'Urbanismo',
  deadlineDays: 30,
  feeAmount: 50,
  tasks: [
    {
      id: 'task-1',
      title: 'Datos del solicitante',
      type: 'FORM',
      description: 'Completa tus datos',
      orderIndex: 0,
      assignedRole: 'ROLE_TRAMITADOR',
      fields: [
        { id: 'f1', label: 'Nombre completo', type: 'text', required: true, options: [] }
      ]
    }
  ],
  formSchema: []
};