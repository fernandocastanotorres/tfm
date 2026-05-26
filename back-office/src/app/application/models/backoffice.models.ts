export interface BackofficeUser {
  id: string;
  email: string;
  roles: string[];
  createdAt: string;
  lastLogin: string | null;
  isActive: boolean;
}

export interface BackofficeUserProfile {
  id: string;
  email: string;
  roles: string[];
}

export interface CaseItem {
  id: string;
  procedureType: string;
  status: string;
  createdAt: string;
  lastUpdated: string;
  title: string;
  description: string;
  assignedUnit: string;
  assignedTo: string | null;
  citizenName: string;
  currentTask: string;
  priority: 'normal' | 'urgent';
  entryNumber?: string | null;
}

export interface CaseDetail {
  id: string;
  procedureTypeId: string;
  procedureType: string;
  status: string;
  createdAt: string;
  lastUpdated: string;
  title: string;
  description: string;
  currentTask: string;
  assignedUnit: string;
  assignedTo: string | null;
  citizenName: string;
  citizenEmail: string;
  timeline: CaseTimelineEvent[];
  attachments: CaseAttachment[];
  formData: Record<string, unknown>;
  entryNumber?: string | null;
}

export interface CaseTimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  actor: string;
}

export interface CaseAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  signed: boolean;
  exitNumber?: string | null;
  generated?: boolean;
}

export interface CaseStatusResponse {
  id: string;
  status: string;
  currentTask: string;
  lastUpdated: string;
}

export interface CaseWorkflowNode {
  key: string;
  label: string;
  category: 'current' | 'visited' | 'next' | 'idle' | string;
  order: number;
  visited: boolean;
  current: boolean;
  reachable: boolean;
}

export interface CaseWorkflowTransition {
  from: string;
  to: string;
  label: string | null;
  visited: boolean;
  candidate: boolean;
}

export interface CaseWorkflowGraph {
  caseId: string;
  currentStatus: string;
  nodes: CaseWorkflowNode[];
  transitions: CaseWorkflowTransition[];
}

export interface PendingTask {
  id: string;
  caseId: string;
  caseTitle: string;
  taskName: string;
  taskType: string;
  assignedTo: string | null;
  dueDate: string | null;
  createdAt: string;
  priority: 'normal' | 'urgent';
}

export interface TaskResolutionRequest {
  action: 'approve' | 'reject' | 'request_amendment' | 'reassign';
  notes: string;
  formData?: Record<string, unknown>;
  assigneeId?: string;
}

export interface DashboardStats {
  totalCases: number;
  pendingCases: number;
  casesInProgress: number;
  completedToday: number;
  overdueCases: number;
  avgResolutionTime: string;
}

export interface DashboardReportSummary {
  totalCases: number;
  pendingCases: number;
  inProgressCases: number;
  resolvedCases: number;
  overdueCases: number;
  slaComplianceRate: number;
  averageResolutionHours: number;
}

export interface DashboardDistributionItem {
  key: string;
  label: string;
  count: number;
}

export interface DashboardDailyTrendPoint {
  day: string;
  createdCases: number;
  resolvedCases: number;
}

export interface DashboardReport {
  summary: DashboardReportSummary;
  byStatus: DashboardDistributionItem[];
  byProcedureType: DashboardDistributionItem[];
  byAssignedUnit: DashboardDistributionItem[];
  dailyTrend: DashboardDailyTrendPoint[];
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: BackofficeUserProfile;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  roles: string[];
  isActive: boolean;
}

export interface UpdateUserRequest {
  email: string;
  roles: string[];
  isActive: boolean;
}

export interface FormSchemaField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'file';
  required: boolean;
  options?: string[];
}

export interface ProcedureTaskConfig {
  id: string;
  title: string;
  type: 'FORM' | 'UPLOAD' | 'REVIEW' | 'SIGNATURE' | 'RESOLUTION';
  description: string;
  orderIndex: number;
  assignedRole: 'ROLE_TRAMITADOR' | 'ROLE_ADMIN';
}

export interface ManagedProcedure {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  assignedUnit: string;
  deadlineDays: number;
  feeAmount: number;
  createdAt: string;
  updatedAt: string;
  tasks: ProcedureTaskConfig[];
  formSchema: FormSchemaField[];
}

export interface ProcedureRequest {
  title: string;
  description: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  assignedUnit: string;
  deadlineDays: number;
  feeAmount: number;
  tasks: ProcedureTaskConfig[];
  formSchema: FormSchemaField[];
}

export interface ProcedureTranslation {
  id: string;
  procedureTypeId: string;
  locale: string;
  title: string;
  description: string;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcedureTranslationRequest {
  locale: string;
  title: string;
  description: string;
  unit: string;
}

export interface PublicLegislationEntry {
  id: string;
  locale: string;
  type: 'law' | 'decree' | 'order' | 'resolution';
  title: string;
  description: string;
  publicationDate: string;
  externalUrl?: string;
  downloadUrl?: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicLegislationUpsertRequest {
  locale: string;
  translationGroupId?: string;
  type: 'law' | 'decree' | 'order' | 'resolution';
  title: string;
  description: string;
  publicationDate: string;
  externalUrl?: string;
  downloadUrl?: string;
  sortOrder: number;
  published: boolean;
}

export interface PublicFaqCategoryEntry {
  id: string;
  locale: string;
  categoryCode: string;
  categoryName: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicFaqCategoryUpsertRequest {
  locale: string;
  translationGroupId?: string;
  categoryCode: string;
  categoryName: string;
  sortOrder: number;
  published: boolean;
}

export interface PublicFaqEntry {
  id: string;
  locale: string;
  categoryCode: string;
  question: string;
  answer: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicFaqUpsertRequest {
  locale: string;
  translationGroupId?: string;
  categoryCode: string;
  question: string;
  answer: string;
  sortOrder: number;
  published: boolean;
}

export interface PublicCalendarEntry {
  id: string;
  locale: string;
  type: 'deadline' | 'holiday' | 'info' | 'reminder';
  title: string;
  description: string;
  eventDate: string;
  relatedProcedure?: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicCalendarUpsertRequest {
  locale: string;
  translationGroupId?: string;
  type: 'deadline' | 'holiday' | 'info' | 'reminder';
  title: string;
  description: string;
  eventDate: string;
  relatedProcedure?: string;
  sortOrder: number;
  published: boolean;
}

export interface PublicInstitutionalEntry {
  id: string;
  locale: string;
  sectionCode: string;
  title: string;
  content: string;
  icon?: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicInstitutionalUpsertRequest {
  locale: string;
  translationGroupId?: string;
  sectionCode: string;
  title: string;
  content: string;
  icon?: string;
  sortOrder: number;
  published: boolean;
}

export interface PublicOrganismEntry {
  id: string;
  locale: string;
  categoryCode: string;
  name: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  websiteUrl?: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicOrganismUpsertRequest {
  locale: string;
  translationGroupId?: string;
  categoryCode: string;
  name: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  websiteUrl?: string;
  sortOrder: number;
  published: boolean;
}

export interface PublicResourceEntry {
  id: string;
  locale: string;
  resourceType: string;
  title: string;
  description: string;
  content: string;
  externalUrl?: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicResourceUpsertRequest {
  locale: string;
  translationGroupId?: string;
  resourceType: string;
  title: string;
  description: string;
  content: string;
  externalUrl?: string;
  sortOrder: number;
  published: boolean;
}

export interface ThemeColor {
  token: string;
  value: string;
}

export interface ThemePalette {
  colors: ThemeColor[];
  updatedAt: string | null;
}

export interface ThemeVariant {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  colors: ThemeColor[];
  active: boolean;
}

export interface ThemeCatalog {
  themes: ThemeVariant[];
  activeThemeId: string | null;
  updatedAt: string | null;
}

export interface ThemePaletteUpsertRequest {
  themes: ThemeVariant[];
  activeThemeId: string;
}

export interface FieldOptionEntry {
  value: string;
  label: string;
}

export interface FieldI18nEntry {
  id: string;
  procedureTypeId: string;
  taskOrderIndex: number;
  taskTitle: string;
  fieldId: string;
  fieldName: string;
  locale: string;
  name: string;
  placeholder: string;
  options: FieldOptionEntry[];
  updatedAt: string;
}

export interface FieldI18nUpsertRequest {
  taskOrderIndex: number;
  fieldId: string;
  locale: string;
  name: string;
  placeholder: string;
  options: FieldOptionEntry[];
}

export interface FieldI18nGroup {
  taskOrderIndex: number;
  taskTitle: string;
  taskType: string;
  fields: FieldI18nEntry[];
}
