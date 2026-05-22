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

export const mockProceduresResponse = [
  {
    id: 'proc-lic-obra-menor',
    slug: 'licencia-obra-menor',
    name: 'Solicitud de licencia de obra menor',
    description: 'Tramitación de licencias para obras de reforma sin alteración estructural.',
    category: 'Urbanismo',
    fee: 85,
    deadline: 30,
    status: 'AVAILABLE',
  },
  {
    id: 'proc-empadronamiento',
    slug: 'alta-empadronamiento',
    name: 'Alta en padrón municipal',
    description: 'Alta o cambio de domicilio en el padrón municipal de habitantes.',
    category: 'Padrón',
    fee: 0,
    deadline: 15,
    status: 'AVAILABLE',
  },
  {
    id: 'proc-certificado-residencia',
    slug: 'certificado-residencia',
    name: 'Certificado de residencia',
    description: 'Solicitud y descarga del certificado de residencia actualizado.',
    category: 'Atención ciudadana',
    fee: 12,
    deadline: 7,
    status: 'AVAILABLE',
  },
];

export const mockProcedureLicenciaDetail = {
  id: 'proc-lic-obra-menor',
  slug: 'licencia-obra-menor',
  name: 'Solicitud de licencia de obra menor',
  description: 'Tramitación de licencias para obras de reforma sin alteración estructural.',
  category: 'Urbanismo',
  fee: 85,
  deadline: 30,
  status: 'AVAILABLE',
  tasks: [
    {
      id: 'task-datos-solicitante',
      name: 'Datos del solicitante',
      type: 'form',
      description: 'Completa tus datos personales y de contacto.',
      formFields: [
        { id: 'subject', name: 'Asunto', type: 'text', required: true, placeholder: 'Describe el asunto' },
        { id: 'description', name: 'Descripción', type: 'textarea', required: true, placeholder: 'Describe los detalles' },
        { id: 'contactEmail', name: 'Correo electrónico', type: 'email', required: true, placeholder: 'tu@email.com' },
        { id: 'contactPhone', name: 'Teléfono de contacto', type: 'phone', required: true, placeholder: '600000000' },
      ],
    },
    {
      id: 'task-documentacion',
      name: 'Documentación obligatoria',
      type: 'upload',
      description: 'Adjunta la documentación mínima exigida para iniciar el expediente.',
      uploadRequirements: [
        { id: 'doc-id', name: 'Documento de identidad', required: true },
        { id: 'doc-supporting', name: 'Documentación complementaria', required: true },
      ],
    },
    {
      id: 'task-revision',
      name: 'Revisión y envío',
      type: 'review',
      description: 'Revisa toda la información antes de registrar la solicitud.',
    },
  ],
};

export const mockCreatedCaseItem = {
  id: 'TEST-001',
  procedureType: 'Solicitud de licencia de obra menor',
  status: 'PENDING',
  createdAt: '2025-05-22T10:00:00Z',
  lastUpdated: '2025-05-22T10:00:00Z',
  title: 'Solicitud de licencia de obra menor',
  description: 'Obra menor para reforma de baño',
  assignedUnit: 'Urbanismo',
};

export const mockCaseDetailResponse = {
  id: 'TEST-001',
  procedureType: 'Solicitud de licencia de obra menor',
  status: 'REVIEW',
  createdAt: '2025-05-22T10:00:00Z',
  lastUpdated: '2025-05-22T10:05:00Z',
  title: 'Solicitud de licencia de obra menor',
  description: 'Obra menor para reforma de baño',
  currentTask: 'Revisión documental',
  assignedUnit: 'Urbanismo',
  timeline: [
    {
      id: 'tl-1',
      title: 'Solicitud registrada',
      date: '2025-05-22T10:00:00Z',
      description: 'El expediente se ha registrado correctamente en la sede electrónica.',
    },
    {
      id: 'tl-2',
      title: 'Expediente enviado',
      date: '2025-05-22T10:05:00Z',
      description: 'La solicitud se ha enviado para su revisión por la unidad gestora.',
    },
  ],
  attachments: [
    {
      id: 'att-1',
      name: 'documento-identidad.pdf',
      type: 'application/pdf',
      size: 245760,
      uploadedAt: '2025-05-22T10:02:00Z',
      signed: true,
    },
  ],
  procedureTypeId: 'licencia-obra-menor',
  formData: null,
};

export const mockCaseStatusResponse = {
  id: 'TEST-001',
  status: 'REVIEW',
  currentTask: 'Revisión documental',
  lastUpdated: '2025-05-22T10:05:00Z',
};

export const mockMessageThreadsResponse = [
  {
    id: 'thread-1',
    procedureId: 'TEST-001',
    caseTitle: 'Solicitud de licencia de obra menor',
    lastMessagePreview: 'Su solicitud está siendo revisada por el departamento de Urbanismo.',
    lastMessageAt: '2025-05-22T11:00:00Z',
    unreadCount: 1,
    totalMessages: 2,
  },
];

export const mockMessagesPagedResponse = {
  messages: [
    {
      id: 'msg-1',
      threadId: 'thread-1',
      senderRole: 'CITIZEN',
      senderName: 'Test User',
      senderEmail: 'test@example.com',
      content: 'Buenos días, adjunto la documentación solicitada.',
      templateKey: null,
      read: true,
      readAt: '2025-05-22T10:30:00Z',
      attachmentCount: 0,
      attachments: [],
      createdAt: '2025-05-22T10:15:00Z',
    },
    {
      id: 'msg-2',
      threadId: 'thread-1',
      senderRole: 'ADMIN',
      senderName: 'Oficina de Urbanismo',
      senderEmail: 'urbanismo@ayuntamiento.es',
      content: 'Su solicitud está siendo revisada por el departamento de Urbanismo.',
      templateKey: null,
      read: false,
      readAt: null,
      attachmentCount: 1,
      attachments: [
        {
          id: 'att-msg-1',
          name: 'notificacion-revision.pdf',
          mimeType: 'application/pdf',
          size: 102400,
          createdAt: '2025-05-22T11:00:00Z',
        },
      ],
      createdAt: '2025-05-22T11:00:00Z',
    },
  ],
  page: 0,
  size: 20,
  totalItems: 2,
  totalPages: 1,
};

export const mockSentMessageResponse = {
  id: 'msg-3',
  threadId: 'thread-1',
  senderRole: 'CITIZEN',
  senderName: 'Test User',
  senderEmail: 'test@example.com',
  content: 'He revisado la notificación, gracias.',
  templateKey: null,
  read: true,
  readAt: '2025-05-22T11:30:00Z',
  attachmentCount: 0,
  attachments: [],
  createdAt: '2025-05-22T11:30:00Z',
};
