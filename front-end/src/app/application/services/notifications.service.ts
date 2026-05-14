import { Injectable } from '@angular/core';

export interface NotificationInboxItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  getInbox(): NotificationInboxItem[] {
    return [
      {
        id: 'INB-1',
        title: 'Revisión completada',
        message: 'Tu expediente EXP-2026-001 está en revisión final.',
        date: '14/05/2026',
        read: false
      },
      {
        id: 'INB-2',
        title: 'Documentación pendiente',
        message: 'Adjunta el justificante de pago antes del 20/05/2026.',
        date: '12/05/2026',
        read: true
      }
    ];
  }
}
