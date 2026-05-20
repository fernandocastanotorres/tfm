import { test as base } from '@playwright/test';

export interface AuthState {
  token: string;
  email: string;
}

export const test = base.extend<{
  authState: AuthState | null;
  authenticatedPage: ReturnType<typeof base.extend>['page'];
}>({
  authState: null,

  authenticatedPage: async ({ page, authState }, use) => {
    if (authState) {
      await page.context().addCookies([
        {
          name: 'auth_token',
          value: authState.token,
          domain: 'localhost',
          path: '/',
          httpOnly: false,
          secure: false,
          sameSite: 'Lax',
        },
      ]);

      await page.context().addInitScript((state) => {
        window.localStorage.setItem('auth_token', state.token);
        window.localStorage.setItem('user_email', state.email);
      }, authState);
    }

    await use(page);
  },
});

export const expect = test.expect;

export const mockAuthState: AuthState = {
  token: 'mock-jwt-token-for-e2e-testing',
  email: 'test@example.com',
};

export const mockCasesResponse = {
  items: [
    {
      id: 'EXP-001',
      title: 'Solicitud de licencia de obras',
      procedureType: 'Urbanismo',
      status: 'PENDING',
      description: 'Solicitud de licencia para reforma menor',
      createdAt: '2024-01-15T10:00:00Z',
      lastUpdated: '2024-01-20T14:30:00Z',
    },
    {
      id: 'EXP-002',
      title: 'Certificado de empadronamiento',
      procedureType: 'Registro Civil',
      status: 'APPROVED',
      description: 'Certificado de empadronamiento para tramite externo',
      createdAt: '2024-02-01T09:00:00Z',
      lastUpdated: '2024-02-05T11:00:00Z',
    },
    {
      id: 'EXP-003',
      title: 'Declaracion responsable',
      procedureType: 'Actividades',
      status: 'REVIEW',
      description: 'Declaracion responsable para apertura de negocio',
      createdAt: '2024-03-10T08:00:00Z',
      lastUpdated: '2024-03-12T16:00:00Z',
    },
  ],
  totalItems: 3,
  totalPages: 1,
  currentPage: 0,
};

export const mockEmptyCasesResponse = {
  items: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 0,
};
