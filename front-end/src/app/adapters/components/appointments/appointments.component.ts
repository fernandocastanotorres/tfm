import { Component, OnInit } from '@angular/core';
import { AppointmentsService, AppointmentItem } from '../../../application/services/appointments.service';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: []
})
export class AppointmentsComponent implements OnInit {
  appointments: AppointmentItem[] = [];
  slots = ['09:00', '10:30', '12:00', '16:00'];
  selectedSlot = '';

  constructor(private readonly appointmentsService: AppointmentsService) {}

  ngOnInit(): void {
    this.appointments = this.appointmentsService.getAppointments();
  }

  selectSlot(slot: string): void {
    this.selectedSlot = slot;
  }
}
