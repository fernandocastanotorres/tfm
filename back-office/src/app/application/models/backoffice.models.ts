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
}

export interface CaseDetail {
  id: string;
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
}

export interface CaseStatusResponse {
  id: string;
  status: string;
  currentTask: string;
  lastUpdated: string;
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
