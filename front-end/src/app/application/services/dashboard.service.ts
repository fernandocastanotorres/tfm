import { Injectable } from '@angular/core';

export interface CaseItem {
  id: string;
  title: string;
  status: 'En revisión' | 'Pendiente' | 'Aprobado';
  lastUpdated: string;
  submittedAt: string;
  category: string;
  description: string;
  assignedUnit: string;
}

export interface NotificationItem {
  id: string;
  message: string;
  date: string;
}

export interface QuickAccessItem {
  id: string;
  title: string;
  description: string;
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
        title: 'Solicitud de licencia',
        status: 'En revisión',
        lastUpdated: '14/05/2026',
        submittedAt: '01/05/2026',
        category: 'Urbanismo',
        description: 'Licencia de obra menor para reforma interior.',
        assignedUnit: 'Unidad de Licencias'
      },
      {
        id: 'EXP-2026-002',
        title: 'Registro de vivienda',
        status: 'Pendiente',
        lastUpdated: '10/05/2026',
        submittedAt: '05/05/2026',
        category: 'Catastro',
        description: 'Alta de vivienda en registro municipal.',
        assignedUnit: 'Unidad de Catastro'
      },
      {
        id: 'EXP-2026-003',
        title: 'Solicitud de empadronamiento',
        status: 'Aprobado',
        lastUpdated: '08/05/2026',
        submittedAt: '29/04/2026',
        category: 'Padrón',
        description: 'Cambio de domicilio en el padrón municipal.',
        assignedUnit: 'Unidad de Padrón'
      }
    ];
  }

  getNotifications(): NotificationItem[] {
    return [
      {
        id: 'NOT-1',
        message: 'Tu solicitud ha cambiado a “En revisión”.',
        date: '14/05/2026'
      },
      {
        id: 'NOT-2',
        message: 'Adjunta la documentación pendiente antes del 20/05/2026.',
        date: '12/05/2026'
      }
    ];
  }

  getQuickAccess(): QuickAccessItem[] {
    return [
      {
        id: 'ACC-1',
        title: 'Nueva solicitud',
        description: 'Inicia un nuevo expediente desde cero.',
        route: '/procedimientos'
      },
      {
        id: 'ACC-2',
        title: 'Mis documentos',
        description: 'Gestiona tus documentos y adjuntos.',
        route: '/documentos'
      },
      {
        id: 'ACC-3',
        title: 'Notificaciones',
        description: 'Revisa tus avisos y comunicaciones.',
        route: '/notificaciones'
      },
      {
        id: 'ACC-4',
        title: 'Mi perfil',
        description: 'Actualiza tus datos personales.',
        route: '/perfil'
      },
      {
        id: 'ACC-5',
        title: 'Pagos y tasas',
        description: 'Consulta y paga tus recibos.',
        route: '/pagos'
      }
    ];
  }
}
