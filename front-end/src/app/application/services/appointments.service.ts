import { Injectable } from '@angular/core';

export interface AppointmentItem {
  id: string;
  service: string;
  date: string;
  time: string;
  location: string;
  status: 'Confirmada' | 'Pendiente';
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  getAppointments(): AppointmentItem[] {
    return [
      {
        id: 'APP-1',
        service: 'Atención urbanismo',
        date: '22/05/2026',
        time: '09:30',
        location: 'Oficina central',
        status: 'Confirmada'
      },
      {
        id: 'APP-2',
        service: 'Atención padrón',
        date: '27/05/2026',
        time: '12:00',
        location: 'Oficina norte',
        status: 'Pendiente'
      }
    ];
  }
}
