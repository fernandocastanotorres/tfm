import { Injectable } from '@angular/core';

export interface AppointmentItem {
  id: string;
  serviceKey: string;
  date: string;
  time: string;
  locationKey: string;
  statusKey: 'APPOINTMENT_STATUS.CONFIRMED' | 'APPOINTMENT_STATUS.PENDING';
  typeKey: string;
  caseId: string;
  caseTitleKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  getAppointments(): AppointmentItem[] {
    return [
      {
        id: 'APP-1',
        serviceKey: 'APPOINTMENTS.MOCK_URBANISM_SERVICE',
        date: '22/05/2026',
        time: '09:30',
        locationKey: 'APPOINTMENTS.LOCATION_CENTRAL',
        statusKey: 'APPOINTMENT_STATUS.CONFIRMED',
        typeKey: 'APPOINTMENTS.TYPE_URBANISM',
        caseId: 'EXP-2026-001',
        caseTitleKey: 'CASE_DETAIL.MOCK_LICENSE_TITLE'
      },
      {
        id: 'APP-2',
        serviceKey: 'APPOINTMENTS.MOCK_REGISTRY_SERVICE',
        date: '27/05/2026',
        time: '12:00',
        locationKey: 'APPOINTMENTS.LOCATION_NORTH',
        statusKey: 'APPOINTMENT_STATUS.PENDING',
        typeKey: 'APPOINTMENTS.TYPE_REGISTRY',
        caseId: 'EXP-2026-002',
        caseTitleKey: 'PROCEDURES.REGISTRY_TITLE'
      },
      {
        id: 'APP-3',
        serviceKey: 'APPOINTMENTS.MOCK_GENERAL_SERVICE',
        date: '30/05/2026',
        time: '10:00',
        locationKey: 'APPOINTMENTS.LOCATION_CENTRAL',
        statusKey: 'APPOINTMENT_STATUS.PENDING',
        typeKey: 'APPOINTMENTS.TYPE_GENERAL',
        caseId: 'EXP-2026-003',
        caseTitleKey: 'CASE_DETAIL.MOCK_LICENSE_TITLE'
      }
    ];
  }
}
