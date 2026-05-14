import { Injectable } from '@angular/core';

export interface CaseItem {
  id: string;
  titleKey: string;
  statusKey: 'CASE_STATUS.REVIEW' | 'CASE_STATUS.PENDING' | 'CASE_STATUS.APPROVED';
  lastUpdated: string;
  submittedAt: string;
  categoryKey: string;
  descriptionKey: string;
  assignedUnitKey: string;
}

export interface NotificationItem {
  id: string;
  messageKey: string;
  date: string;
}

export interface QuickAccessItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  route: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  getCases(): CaseItem[] {
    return [
      {
        id: 'EXP-2026-001',
        titleKey: 'DASHBOARD.MOCK_LICENSE_TITLE',
        statusKey: 'CASE_STATUS.REVIEW',
        lastUpdated: '14/05/2026',
        submittedAt: '01/05/2026',
        categoryKey: 'DASHBOARD.MOCK_CATEGORY_URBANISM',
        descriptionKey: 'DASHBOARD.MOCK_LICENSE_DESC',
        assignedUnitKey: 'CASE_DETAIL.MOCK_UNIT_LICENSES'
      },
      {
        id: 'EXP-2026-002',
        titleKey: 'DASHBOARD.MOCK_REGISTRY_TITLE',
        statusKey: 'CASE_STATUS.PENDING',
        lastUpdated: '10/05/2026',
        submittedAt: '05/05/2026',
        categoryKey: 'DASHBOARD.MOCK_CATEGORY_CADASTRE',
        descriptionKey: 'DASHBOARD.MOCK_REGISTRY_DESC',
        assignedUnitKey: 'PROCEDURES.UNIT_REGISTRY'
      },
      {
        id: 'EXP-2026-003',
        titleKey: 'DASHBOARD.MOCK_APPLICATION_TITLE',
        statusKey: 'CASE_STATUS.APPROVED',
        lastUpdated: '08/05/2026',
        submittedAt: '29/04/2026',
        categoryKey: 'DASHBOARD.MOCK_CATEGORY_REGISTRY',
        descriptionKey: 'DASHBOARD.MOCK_APPLICATION_DESC',
        assignedUnitKey: 'PROCEDURES.UNIT_REGISTRY'
      }
    ];
  }

  getNotifications(): NotificationItem[] {
    return [
      {
        id: 'NOT-1',
        messageKey: 'DASHBOARD.MOCK_NOTIFICATION_REVIEW',
        date: '14/05/2026'
      },
      {
        id: 'NOT-2',
        messageKey: 'DASHBOARD.MOCK_NOTIFICATION_DOCUMENTS',
        date: '12/05/2026'
      }
    ];
  }

  getQuickAccess(): QuickAccessItem[] {
    return [
      {
        id: 'ACC-1',
        titleKey: 'DASHBOARD.MOCK_QUICK_NEW_CASE',
        descriptionKey: 'DASHBOARD.MOCK_QUICK_NEW_CASE_DESC',
        route: '/procedimientos'
      },
      {
        id: 'ACC-2',
        titleKey: 'DASHBOARD.MOCK_QUICK_DOCUMENTS',
        descriptionKey: 'DASHBOARD.MOCK_QUICK_DOCUMENTS_DESC',
        route: '/documentos'
      },
      {
        id: 'ACC-3',
        titleKey: 'DASHBOARD.MOCK_QUICK_NOTIFICATIONS',
        descriptionKey: 'DASHBOARD.MOCK_QUICK_NOTIFICATIONS_DESC',
        route: '/notificaciones'
      },
      {
        id: 'ACC-4',
        titleKey: 'DASHBOARD.MOCK_QUICK_PROFILE',
        descriptionKey: 'DASHBOARD.MOCK_QUICK_PROFILE_DESC',
        route: '/perfil'
      },
      {
        id: 'ACC-5',
        titleKey: 'DASHBOARD.MOCK_QUICK_PAYMENTS',
        descriptionKey: 'DASHBOARD.MOCK_QUICK_PAYMENTS_DESC',
        route: '/pagos'
      }
    ];
  }
}
