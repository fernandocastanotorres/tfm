import { Injectable } from '@angular/core';

export interface CaseTimelineEvent {
  id: string;
  titleKey: string;
  date: string;
  descriptionKey: string;
}

export interface CaseAttachment {
  id: string;
  nameKey: string;
  type: string;
  uploadedAt: string;
}

export interface CaseDetail {
  id: string;
  titleKey: string;
  statusKey: string;
  categoryKey: string;
  assignedUnitKey: string;
  submittedAt: string;
  descriptionKey: string;
  timeline: CaseTimelineEvent[];
  attachments: CaseAttachment[];
}

@Injectable({
  providedIn: 'root'
})
export class CaseDetailService {
  getCaseDetail(): CaseDetail {
    return {
      id: 'EXP-2026-001',
      titleKey: 'CASE_DETAIL.MOCK_LICENSE_TITLE',
      statusKey: 'CASE_STATUS.REVIEW',
      categoryKey: 'CASE_DETAIL.MOCK_CATEGORY_URBANISM',
      assignedUnitKey: 'CASE_DETAIL.MOCK_UNIT_LICENSES',
      submittedAt: '01/05/2026',
      descriptionKey: 'CASE_DETAIL.MOCK_LICENSE_DESC',
      timeline: [
        {
          id: 'EV-1',
          titleKey: 'CASE_DETAIL.MOCK_TIMELINE_REGISTERED_TITLE',
          date: '01/05/2026',
          descriptionKey: 'CASE_DETAIL.MOCK_TIMELINE_REGISTERED_DESC'
        },
        {
          id: 'EV-2',
          titleKey: 'CASE_DETAIL.MOCK_TIMELINE_REVIEW_TITLE',
          date: '05/05/2026',
          descriptionKey: 'CASE_DETAIL.MOCK_TIMELINE_REVIEW_DESC'
        }
      ],
      attachments: [
        {
          id: 'AT-1',
          nameKey: 'CASE_DETAIL.MOCK_ATTACHMENT_PLAN',
          type: 'PDF',
          uploadedAt: '01/05/2026'
        },
        {
          id: 'AT-2',
          nameKey: 'CASE_DETAIL.MOCK_ATTACHMENT_ID',
          type: 'PDF',
          uploadedAt: '01/05/2026'
        }
      ]
    };
  }
}
