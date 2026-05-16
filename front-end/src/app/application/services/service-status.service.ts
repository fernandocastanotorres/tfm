import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ServiceStatusItem } from '../models/sede.models';

@Injectable({
  providedIn: 'root'
})
export class ServiceStatusService {
  private readonly services: ServiceStatusItem[] = [
    {
      id: 'auth',
      nameKey: 'SERVICE_STATUS.AUTH',
      status: 'operational',
      descriptionKey: 'SERVICE_STATUS.AUTH_DESC',
      lastUpdated: '2026-05-16T10:30:00Z'
    },
    {
      id: 'procedures',
      nameKey: 'SERVICE_STATUS.PROCEDURES',
      status: 'operational',
      descriptionKey: 'SERVICE_STATUS.PROCEDURES_DESC',
      lastUpdated: '2026-05-16T10:25:00Z'
    },
    {
      id: 'notifications',
      nameKey: 'SERVICE_STATUS.NOTIFICATIONS',
      status: 'operational',
      descriptionKey: 'SERVICE_STATUS.NOTIFICATIONS_DESC',
      lastUpdated: '2026-05-16T10:20:00Z'
    },
    {
      id: 'payments',
      nameKey: 'SERVICE_STATUS.PAYMENTS',
      status: 'degraded',
      descriptionKey: 'SERVICE_STATUS.PAYMENTS_DESC',
      lastUpdated: '2026-05-16T09:45:00Z'
    },
    {
      id: 'appointments',
      nameKey: 'SERVICE_STATUS.APPOINTMENTS',
      status: 'operational',
      descriptionKey: 'SERVICE_STATUS.APPOINTMENTS_DESC',
      lastUpdated: '2026-05-16T10:15:00Z'
    },
    {
      id: 'documents',
      nameKey: 'SERVICE_STATUS.DOCUMENTS',
      status: 'operational',
      descriptionKey: 'SERVICE_STATUS.DOCUMENTS_DESC',
      lastUpdated: '2026-05-16T10:30:00Z'
    },
    {
      id: 'messages',
      nameKey: 'SERVICE_STATUS.MESSAGES',
      status: 'maintenance',
      descriptionKey: 'SERVICE_STATUS.MESSAGES_DESC',
      lastUpdated: '2026-05-16T08:00:00Z'
    },
    {
      id: 'registry',
      nameKey: 'SERVICE_STATUS.REGISTRY',
      status: 'operational',
      descriptionKey: 'SERVICE_STATUS.REGISTRY_DESC',
      lastUpdated: '2026-05-16T10:28:00Z'
    }
  ];

  getAllStatus(): Observable<ServiceStatusItem[]> {
    return of(this.services).pipe(delay(300));
  }

  getStatusById(id: string): Observable<ServiceStatusItem | undefined> {
    const found = this.services.find(s => s.id === id);
    return of(found).pipe(delay(300));
  }

  getOperationalCount(): Observable<number> {
    return of(this.services.filter(s => s.status === 'operational').length).pipe(delay(300));
  }
}
