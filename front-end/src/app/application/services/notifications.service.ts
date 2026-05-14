import { Injectable } from '@angular/core';

export interface NotificationInboxItem {
  id: string;
  titleKey: string;
  messageKey: string;
  date: string;
  read: boolean;
  caseId: string;
  caseTitleKey: string;
  typeKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  getInbox(): NotificationInboxItem[] {
    return [
      {
        id: 'INB-1',
        titleKey: 'NOTIFICATIONS.MOCK_REVIEW_TITLE',
        messageKey: 'NOTIFICATIONS.MOCK_REVIEW_MESSAGE',
        date: '14/05/2026',
        read: false,
        caseId: 'EXP-2026-001',
        caseTitleKey: 'CASE_DETAIL.MOCK_LICENSE_TITLE',
        typeKey: 'NOTIFICATIONS.TYPE_STATUS'
      },
      {
        id: 'INB-2',
        titleKey: 'NOTIFICATIONS.MOCK_DOCUMENTS_TITLE',
        messageKey: 'NOTIFICATIONS.MOCK_DOCUMENTS_MESSAGE',
        date: '12/05/2026',
        read: true,
        caseId: 'EXP-2026-002',
        caseTitleKey: 'DASHBOARD.CASES_TITLE',
        typeKey: 'NOTIFICATIONS.TYPE_DOCUMENTS'
      },
      {
        id: 'INB-3',
        titleKey: 'NOTIFICATIONS.MOCK_PAYMENT_TITLE',
        messageKey: 'NOTIFICATIONS.MOCK_PAYMENT_MESSAGE',
        date: '10/05/2026',
        read: false,
        caseId: 'EXP-2026-003',
        caseTitleKey: 'CASE_DETAIL.MOCK_LICENSE_TITLE',
        typeKey: 'NOTIFICATIONS.TYPE_PAYMENTS'
      }
    ];
  }
}
