import { Injectable } from '@angular/core';

export interface MessageThread {
  id: string;
  subject: string;
  lastMessage: string;
  updatedAt: string;
  unread: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  getThreads(): MessageThread[] {
    return [
      {
        id: 'MSG-1',
        subject: 'Consulta sobre licencia',
        lastMessage: 'Hemos recibido tu consulta y la estamos revisando.',
        updatedAt: '14/05/2026',
        unread: true
      },
      {
        id: 'MSG-2',
        subject: 'Documentación pendiente',
        lastMessage: 'Falta adjuntar el justificante de pago.',
        updatedAt: '12/05/2026',
        unread: false
      }
    ];
  }
}
