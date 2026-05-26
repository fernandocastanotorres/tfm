/**
 * API response models for case/procedure management.
 * Backend: Spring Boot 3.2.5 at /api/v1/citizen/procedures/*
 */

export interface CaseItem {
  id: string;
  recordNumber?: string | null;
  entryNumber?: string | null;
  procedureType: string;
  status: string;
  createdAt: string;
  lastUpdated: string;
  title: string;
  description: string;
  assignedUnit: string;
}

export interface CaseTimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
}

export interface CaseAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  signed: boolean;
  hasOriginal?: boolean;
  hasSigned?: boolean;
  csvCode?: string | null;
  exitNumber?: string | null;
  generated?: boolean;
}

export interface CaseDetail {
  id: string;
  recordNumber?: string | null;
  entryNumber?: string | null;
  procedureType: string;
  status: string;
  createdAt: string;
  lastUpdated: string;
  title: string;
  description: string;
  currentTask: string;
  assignedUnit: string;
  timeline: CaseTimelineEvent[];
  attachments: CaseAttachment[];
  procedureTypeId: string;
  formData: Record<string, unknown> | null;
}

export interface CaseStatusResponse {
  id: string;
  recordNumber?: string | null;
  entryNumber?: string | null;
  status: string;
  currentTask: string;
  lastUpdated: string;
}

export interface CreateCaseRequest {
  procedureId: string;
  title: string;
  formData: Record<string, unknown>;
}

export interface AmendCaseRequest {
  reason: string;
  formData?: Record<string, unknown>;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}
