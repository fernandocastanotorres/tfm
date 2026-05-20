/**
 * API response models for document management.
 * Backend: Spring Boot 3.2.5 at /api/v1/citizen/procedures/{caseId}/documents/*
 */

export interface DocumentItem {
  id: string;
  caseId: string;
  name: string;
  type: string;
  size: number;
  status: string;
  uploadedAt: string;
  isSigned?: boolean;
}

export interface DocumentDetail {
  id: string;
  caseId: string;
  name: string;
  type: string;
  size: number;
  status: string;
  uploadedAt: string;
  checksum: string;
  version: number;
}

export interface DocumentVersion {
  id: string;
  version: number;
  size: number;
  uploadedAt: string;
  status: string;
}
