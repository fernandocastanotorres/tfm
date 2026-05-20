import {
  BackofficeUserProfile,
  BackofficeUser,
  CaseItem,
  CaseDetail,
  DashboardStats,
  ManagedProcedure,
  PendingTask,
  PagedResponse
} from '../models/backoffice.models';

export const mockAdminUser: BackofficeUserProfile = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  email: 'admin@tfg.es',
  roles: ['ROLE_ADMIN', 'ROLE_CITIZEN']
};

export const mockTramitadorUser: BackofficeUserProfile = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  email: 'tramitador@tfg.es',
  roles: ['ROLE_TRAMITADOR']
};

export const mockBackofficeUsers: BackofficeUser[] = [
  {
    id: mockAdminUser.id,
    email: mockAdminUser.email,
    roles: mockAdminUser.roles,
    createdAt: '2026-05-01T09:00:00.000Z',
    lastLogin: new Date().toISOString(),
    isActive: true
  },
  {
    id: mockTramitadorUser.id,
    email: mockTramitadorUser.email,
    roles: mockTramitadorUser.roles,
    createdAt: '2026-05-02T10:30:00.000Z',
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    isActive: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'registro@tfg.es',
    roles: ['ROLE_TRAMITADOR'],
    createdAt: '2026-05-03T11:15:00.000Z',
    lastLogin: null,
    isActive: false
  }
];

const now = new Date();
const yesterday = new Date(now.getTime() - 86400000);
const twoDaysAgo = new Date(now.getTime() - 172800000);
const threeDaysAgo = new Date(now.getTime() - 259200000);

export const mockCases: CaseItem[] = [
  {
    id: 'a1b2c3d4-0001-0000-0000-000000000001',
    procedureType: 'Solicitud de Licencia',
    status: 'SUBMITTED',
    createdAt: threeDaysAgo.toISOString(),
    lastUpdated: yesterday.toISOString(),
    title: 'Licencia de apertura - Bar Central',
    description: 'Solicitud de licencia de actividad para local hosteleria',
    assignedUnit: 'Unidad de Licencias',
    assignedTo: 'tramitador@tfg.es',
    citizenName: 'Juan Garcia Lopez',
    currentTask: 'Revision de documentacion',
    priority: 'normal'
  },
  {
    id: 'a1b2c3d4-0002-0000-0000-000000000002',
    procedureType: 'Certificado Registral',
    status: 'IN_PROGRESS',
    createdAt: twoDaysAgo.toISOString(),
    lastUpdated: now.toISOString(),
    title: 'Certificado de empadronamiento',
    description: 'Solicitud de certificado de empadronamiento colectivo',
    assignedUnit: 'Oficina de Registro',
    assignedTo: 'admin@tfg.es',
    citizenName: 'Maria Fernandez Ruiz',
    currentTask: 'Verificacion de identidad',
    priority: 'urgent'
  },
  {
    id: 'a1b2c3d4-0003-0000-0000-000000000003',
    procedureType: 'Cambio de Domicilio',
    status: 'PENDING_AMENDMENT',
    createdAt: threeDaysAgo.toISOString(),
    lastUpdated: twoDaysAgo.toISOString(),
    title: 'Actualizacion de domicilio fiscal',
    description: 'Cambio de domicilio registrado en el padron municipal',
    assignedUnit: 'Servicios al Ciudadano',
    assignedTo: null,
    citizenName: 'Carlos Martinez Soto',
    currentTask: 'Subsanacion requerida',
    priority: 'normal'
  },
  {
    id: 'a1b2c3d4-0004-0000-0000-000000000004',
    procedureType: 'Solicitud de Licencia',
    status: 'DRAFT',
    createdAt: now.toISOString(),
    lastUpdated: now.toISOString(),
    title: 'Licencia de obras menor',
    description: 'Reforma interior de vivienda sin alteracion estructural',
    assignedUnit: 'Unidad de Licencias',
    assignedTo: null,
    citizenName: 'Ana Lopez Torres',
    currentTask: '',
    priority: 'normal'
  },
  {
    id: 'a1b2c3d4-0005-0000-0000-000000000005',
    procedureType: 'Certificado Registral',
    status: 'RESOLVED',
    createdAt: threeDaysAgo.toISOString(),
    lastUpdated: yesterday.toISOString(),
    title: 'Certificado de antecedentes',
    description: 'Certificado para tramite de nacionalidad',
    assignedUnit: 'Oficina de Registro',
    assignedTo: 'tramitador@tfg.es',
    citizenName: 'Pedro Sanchez Gil',
    currentTask: '',
    priority: 'normal'
  },
  {
    id: 'a1b2c3d4-0006-0000-0000-000000000006',
    procedureType: 'Cambio de Domicilio',
    status: 'IN_PROGRESS',
    createdAt: twoDaysAgo.toISOString(),
    lastUpdated: now.toISOString(),
    title: 'Alta padronal - Nueva vivienda',
    description: 'Inscripcion en el padron municipal por cambio de residencia',
    assignedUnit: 'Servicios al Ciudadano',
    assignedTo: 'admin@tfg.es',
    citizenName: 'Laura Gomez Diaz',
    currentTask: 'Comprobacion de documentos',
    priority: 'urgent'
  }
];

export const mockCaseDetails: Record<string, CaseDetail> = {
  'a1b2c3d4-0001-0000-0000-000000000001': {
    id: 'a1b2c3d4-0001-0000-0000-000000000001',
    procedureType: 'Solicitud de Licencia',
    status: 'SUBMITTED',
    createdAt: threeDaysAgo.toISOString(),
    lastUpdated: yesterday.toISOString(),
    title: 'Licencia de apertura - Bar Central',
    description: 'Solicitud de licencia de actividad para local hosteleria',
    currentTask: 'Revision de documentacion',
    assignedUnit: 'Unidad de Licencias',
    assignedTo: 'tramitador@tfg.es',
    citizenName: 'Juan Garcia Lopez',
    citizenEmail: 'juan.garcia@email.es',
    timeline: [
      { id: 't1', title: 'Expediente creado', date: threeDaysAgo.toISOString(), description: 'El ciudadano ha iniciado el tramite', actor: 'Juan Garcia Lopez' },
      { id: 't2', title: 'Documentos adjuntados', date: twoDaysAgo.toISOString(), description: 'Se han subido 3 documentos', actor: 'Juan Garcia Lopez' },
      { id: 't3', title: 'Expediente presentado', date: yesterday.toISOString(), description: 'El expediente ha sido presentado formalmente', actor: 'Juan Garcia Lopez' }
    ],
    attachments: [
      { id: 'd1', name: 'plano_local.pdf', type: 'application/pdf', size: 245000, uploadedAt: twoDaysAgo.toISOString(), uploadedBy: 'Juan Garcia Lopez', signed: true },
      { id: 'd2', name: 'contrato_alquiler.pdf', type: 'application/pdf', size: 180000, uploadedAt: twoDaysAgo.toISOString(), uploadedBy: 'Juan Garcia Lopez', signed: true },
      { id: 'd3', name: 'licencia_actividad_anterior.pdf', type: 'application/pdf', size: 95000, uploadedAt: twoDaysAgo.toISOString(), uploadedBy: 'Juan Garcia Lopez', signed: true }
    ],
    formData: {
      nombreEstablecimiento: 'Bar Central',
      tipoActividad: 'Hosteleria',
      direccion: 'Calle Mayor 15, 28001 Madrid',
      superficie: '85 m2',
      aforo: '40 personas'
    }
  },
  'a1b2c3d4-0002-0000-0000-000000000002': {
    id: 'a1b2c3d4-0002-0000-0000-000000000002',
    procedureType: 'Certificado Registral',
    status: 'IN_PROGRESS',
    createdAt: twoDaysAgo.toISOString(),
    lastUpdated: now.toISOString(),
    title: 'Certificado de empadronamiento',
    description: 'Solicitud de certificado de empadronamiento colectivo',
    currentTask: 'Verificacion de identidad',
    assignedUnit: 'Oficina de Registro',
    assignedTo: 'admin@tfg.es',
    citizenName: 'Maria Fernandez Ruiz',
    citizenEmail: 'maria.fernandez@email.es',
    timeline: [
      { id: 't1', title: 'Expediente creado', date: twoDaysAgo.toISOString(), description: 'Solicitud iniciada', actor: 'Maria Fernandez Ruiz' },
      { id: 't2', title: 'En tramitacion', date: yesterday.toISOString(), description: 'Asignado a Maria Fernandez', actor: 'Sistema' }
    ],
    attachments: [
      { id: 'd1', name: 'dni_escaneado.pdf', type: 'application/pdf', size: 320000, uploadedAt: twoDaysAgo.toISOString(), uploadedBy: 'Maria Fernandez Ruiz', signed: true }
    ],
    formData: {
      tipoCertificado: 'Empadronamiento colectivo',
      finalidad: 'Tramite administrativo',
      numeroPersonas: '3'
    }
  }
};

export const mockDashboardStats: DashboardStats = {
  totalCases: 247,
  pendingCases: 18,
  casesInProgress: 34,
  completedToday: 5,
  overdueCases: 3,
  avgResolutionTime: '4.2 dias'
};

export const mockPendingTasks: PendingTask[] = [
  {
    id: 'task-001',
    caseId: 'a1b2c3d4-0001-0000-0000-000000000001',
    caseTitle: 'Licencia de apertura - Bar Central',
    taskName: 'Revision de documentacion',
    taskType: 'REVIEW',
    assignedTo: 'tramitador@tfg.es',
    dueDate: new Date(now.getTime() + 86400000 * 2).toISOString(),
    createdAt: yesterday.toISOString(),
    priority: 'normal'
  },
  {
    id: 'task-002',
    caseId: 'a1b2c3d4-0002-0000-0000-000000000002',
    caseTitle: 'Certificado de empadronamiento',
    taskName: 'Verificacion de identidad',
    taskType: 'VERIFY',
    assignedTo: 'admin@tfg.es',
    dueDate: new Date(now.getTime() + 86400000).toISOString(),
    createdAt: yesterday.toISOString(),
    priority: 'urgent'
  },
  {
    id: 'task-003',
    caseId: 'a1b2c3d4-0006-0000-0000-000000000006',
    caseTitle: 'Alta padronal - Nueva vivienda',
    taskName: 'Comprobacion de documentos',
    taskType: 'VERIFY',
    assignedTo: 'admin@tfg.es',
    dueDate: new Date(now.getTime() + 86400000 * 3).toISOString(),
    createdAt: now.toISOString(),
    priority: 'urgent'
  }
];

export const mockProcedures: ManagedProcedure[] = [
  {
    id: 'proc-001',
    title: 'Solicitud de Licencia',
    description: 'Solicitud de licencia de actividad para comercios y locales.',
    category: 'Licencias',
    status: 'ACTIVE',
    assignedUnit: 'Unidad de Licencias',
    deadlineDays: 30,
    feeAmount: 25,
    createdAt: '2026-05-01T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
    tasks: [
      { id: 'pt-001', title: 'Datos del establecimiento', type: 'FORM', description: 'Captura de datos principales', orderIndex: 0, assignedRole: 'ROLE_TRAMITADOR' },
      { id: 'pt-002', title: 'Documentacion tecnica', type: 'UPLOAD', description: 'Revision de planos y contratos', orderIndex: 1, assignedRole: 'ROLE_TRAMITADOR' },
      { id: 'pt-003', title: 'Resolucion administrativa', type: 'RESOLUTION', description: 'Aprobacion o denegacion', orderIndex: 2, assignedRole: 'ROLE_ADMIN' }
    ],
    formSchema: [
      { id: 'businessName', label: 'Nombre del establecimiento', type: 'text', required: true },
      { id: 'activityType', label: 'Tipo de actividad', type: 'select', required: true, options: ['Hosteleria', 'Comercio', 'Servicios'] },
      { id: 'surface', label: 'Superficie', type: 'number', required: true }
    ]
  },
  {
    id: 'proc-002',
    title: 'Certificado Registral',
    description: 'Emision de certificados oficiales del registro municipal.',
    category: 'Registro',
    status: 'ACTIVE',
    assignedUnit: 'Oficina de Registro',
    deadlineDays: 15,
    feeAmount: 10,
    createdAt: '2026-05-04T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
    tasks: [
      { id: 'pt-004', title: 'Datos del certificado', type: 'FORM', description: 'Seleccion del tipo de certificado', orderIndex: 0, assignedRole: 'ROLE_TRAMITADOR' },
      { id: 'pt-005', title: 'Verificacion de identidad', type: 'REVIEW', description: 'Validacion de identidad', orderIndex: 1, assignedRole: 'ROLE_TRAMITADOR' }
    ],
    formSchema: [
      { id: 'certificateType', label: 'Tipo de certificado', type: 'select', required: true, options: ['Empadronamiento', 'Convivencia', 'Antecedentes'] },
      { id: 'purpose', label: 'Finalidad', type: 'textarea', required: true }
    ]
  },
  {
    id: 'proc-003',
    title: 'Cambio de Domicilio',
    description: 'Actualizacion de domicilio en registros municipales.',
    category: 'Ciudadania',
    status: 'DRAFT',
    assignedUnit: 'Servicios al Ciudadano',
    deadlineDays: 7,
    feeAmount: 0,
    createdAt: '2026-05-08T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
    tasks: [
      { id: 'pt-006', title: 'Nuevo domicilio', type: 'FORM', description: 'Datos del nuevo domicilio', orderIndex: 0, assignedRole: 'ROLE_TRAMITADOR' }
    ],
    formSchema: [
      { id: 'newAddress', label: 'Nuevo domicilio', type: 'text', required: true },
      { id: 'effectiveDate', label: 'Fecha de efecto', type: 'date', required: true }
    ]
  }
];

export function getPagedCases(page: number, size: number, status?: string): PagedResponse<CaseItem> {
  let filtered = mockCases;
  if (status) {
    filtered = mockCases.filter(c => c.status === status);
  }
  const start = page * size;
  const end = start + size;
  const items = filtered.slice(start, end);
  return {
    items,
    page,
    size,
    totalItems: filtered.length,
    totalPages: Math.ceil(filtered.length / size)
  };
}
