import { Injectable } from '@angular/core';

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
  getNotifications(): NotificationItem[] {
    // @todo Replace mock data with real backend endpoint
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
    // @todo Replace mock data with real backend endpoint
    return [
      {
        id: 'ACC-1',
        titleKey: 'DASHBOARD.MOCK_QUICK_NEW_CASE',
        descriptionKey: 'DASHBOARD.MOCK_QUICK_NEW_CASE_DESC',
        route: '/sede/procedimientos'
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
