import { TestBed } from '@angular/core/testing';
import { AppointmentsService, AppointmentItem } from './appointments.service';

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppointmentsService]
    });
    service = TestBed.inject(AppointmentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAppointments', () => {
    it('should return an array of AppointmentItem', () => {
      const appointments = service.getAppointments();
      expect(Array.isArray(appointments)).toBeTrue();
      expect(appointments.length).toBeGreaterThan(0);
    });

    it('should return appointments with required properties', () => {
      const appointments = service.getAppointments();
      const appointment = appointments[0];

      expect(appointment.id).toBeDefined();
      expect(appointment.serviceKey).toBeDefined();
      expect(appointment.date).toBeDefined();
      expect(appointment.time).toBeDefined();
      expect(appointment.locationKey).toBeDefined();
      expect(appointment.statusKey).toBeDefined();
      expect(appointment.typeKey).toBeDefined();
      expect(appointment.caseId).toBeDefined();
      expect(appointment.caseTitleKey).toBeDefined();
    });

    it('should return appointments with valid status values', () => {
      const appointments = service.getAppointments();
      const validStatuses = ['APPOINTMENT_STATUS.CONFIRMED', 'APPOINTMENT_STATUS.PENDING'];

      for (const appt of appointments) {
        expect(validStatuses).toContain(appt.statusKey);
      }
    });

    it('should return appointments with unique IDs', () => {
      const appointments = service.getAppointments();
      const ids = appointments.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should return a mix of confirmed and pending appointments', () => {
      const appointments = service.getAppointments();
      const confirmed = appointments.filter(a => a.statusKey === 'APPOINTMENT_STATUS.CONFIRMED');
      const pending = appointments.filter(a => a.statusKey === 'APPOINTMENT_STATUS.PENDING');
      expect(confirmed.length).toBeGreaterThan(0);
      expect(pending.length).toBeGreaterThan(0);
    });

    it('should return consistent mock data on each call', () => {
      const appts1 = service.getAppointments();
      const appts2 = service.getAppointments();
      expect(appts1.length).toBe(appts2.length);
      expect(appts1[0].id).toBe(appts2[0].id);
    });
  });
});
