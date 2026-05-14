import { Injectable } from '@angular/core';

export interface DocumentItem {
  id: string;
  nameKey: string;
  typeKey: string;
  statusKey: 'DOCUMENT_STATUS.PENDING' | 'DOCUMENT_STATUS.VALIDATED';
  updatedAt: string;
  caseId: string;
  caseTitleKey: string;
  version: string;
  sizeLabel: string;
  unitKey: string;
  versions: DocumentVersion[];
}

export interface DocumentVersion {
  id: string;
  version: string;
  sizeLabel: string;
  uploadedAt: string;
  statusKey: 'DOCUMENT_STATUS.PENDING' | 'DOCUMENT_STATUS.VALIDATED';
}

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  getDocuments(): DocumentItem[] {
    return [
      {
        id: 'DOC-1',
        nameKey: 'DOCUMENTS.MOCK_ID_CARD',
        typeKey: 'DOCUMENTS.TYPE_PDF',
        statusKey: 'DOCUMENT_STATUS.VALIDATED',
        updatedAt: '12/05/2026',
        caseId: 'EXP-2026-001',
        caseTitleKey: 'CASE_DETAIL.MOCK_LICENSE_TITLE',
        version: 'v2.0',
        sizeLabel: '2.4 MB',
        unitKey: 'CASE_DETAIL.MOCK_UNIT_LICENSES',
        versions: [
          {
            id: 'DOC-1-V1',
            version: 'v1.0',
            sizeLabel: '2.1 MB',
            uploadedAt: '01/05/2026',
            statusKey: 'DOCUMENT_STATUS.PENDING'
          },
          {
            id: 'DOC-1-V2',
            version: 'v2.0',
            sizeLabel: '2.4 MB',
            uploadedAt: '12/05/2026',
            statusKey: 'DOCUMENT_STATUS.VALIDATED'
          }
        ]
      },
      {
        id: 'DOC-2',
        nameKey: 'DOCUMENTS.MOCK_PAYMENT_RECEIPT',
        typeKey: 'DOCUMENTS.TYPE_PDF',
        statusKey: 'DOCUMENT_STATUS.PENDING',
        updatedAt: '10/05/2026',
        caseId: 'EXP-2026-002',
        caseTitleKey: 'DASHBOARD.CASES_TITLE',
        version: 'v1.0',
        sizeLabel: '540 KB',
        unitKey: 'PROCEDURES.UNIT_GENERAL',
        versions: [
          {
            id: 'DOC-2-V1',
            version: 'v1.0',
            sizeLabel: '540 KB',
            uploadedAt: '10/05/2026',
            statusKey: 'DOCUMENT_STATUS.PENDING'
          }
        ]
      },
      {
        id: 'DOC-3',
        nameKey: 'DOCUMENTS.MOCK_APPLICATION_FORM',
        typeKey: 'DOCUMENTS.TYPE_DOCX',
        statusKey: 'DOCUMENT_STATUS.PENDING',
        updatedAt: '08/05/2026',
        caseId: 'EXP-2026-003',
        caseTitleKey: 'CASE_DETAIL.MOCK_LICENSE_TITLE',
        version: 'v1.1',
        sizeLabel: '1.1 MB',
        unitKey: 'PROCEDURES.UNIT_REGISTRY',
        versions: [
          {
            id: 'DOC-3-V1',
            version: 'v1.0',
            sizeLabel: '1.0 MB',
            uploadedAt: '05/05/2026',
            statusKey: 'DOCUMENT_STATUS.PENDING'
          },
          {
            id: 'DOC-3-V2',
            version: 'v1.1',
            sizeLabel: '1.1 MB',
            uploadedAt: '08/05/2026',
            statusKey: 'DOCUMENT_STATUS.PENDING'
          }
        ]
      }
    ];
  }
}
