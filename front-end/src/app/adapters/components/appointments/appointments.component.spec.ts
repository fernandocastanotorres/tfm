import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsComponent } from './appointments.component';
import { AppointmentsService } from '../../../application/services/appointments.service';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

describe('AppointmentsComponent', () => {
  let component: AppointmentsComponent;
  let fixture: ComponentFixture<AppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot(), ReactiveFormsModule, AppointmentsComponent],
    providers: [AppointmentsService]
}).compileComponents();

    fixture = TestBed.createComponent(AppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load appointments', () => {
    expect(component.appointments.length).toBeGreaterThan(0);
  });

  it('should select slot', () => {
    component.selectSlot('09:00');
    expect(component.selectedSlot).toBe('09:00');
  });

  it('should filter appointments by specific status', () => {
    component.filterForm.patchValue({ status: 'confirmed' });
    const filtered = component.filteredAppointments;
    expect(filtered.every(a => a.statusKey.toLowerCase().includes('confirmed'))).toBeTrue();
  });

  it('should filter appointments by specific type', () => {
    component.filterForm.patchValue({ type: 'APPOINTMENTS.TYPE_URBANISM' });
    const filtered = component.filteredAppointments;
    expect(filtered.every(a => a.typeKey === 'APPOINTMENTS.TYPE_URBANISM')).toBeTrue();
  });

  it('should filter appointments by specific caseId', () => {
    component.filterForm.patchValue({ caseId: 'EXP-2026-001' });
    const filtered = component.filteredAppointments;
    expect(filtered.every(a => a.caseId === 'EXP-2026-001')).toBeTrue();
  });

  it('should sort appointments by time', () => {
    component.filterForm.patchValue({ sort: 'time' });
    const sorted = component.filteredAppointments;
    expect(sorted.length).toBeGreaterThan(0);
  });

  it('should return MAX_SAFE_INTEGER for invalid date format', () => {
    const result = (component as any).toSortableDate('invalid-date');
    expect(result).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('should return MAX_SAFE_INTEGER for partial date', () => {
    const result = (component as any).toSortableDate('25/05/');
    expect(result).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('should filter appointments by search text matching caseId', () => {
    component.filterForm.patchValue({ search: 'EXP-2026-001' });
    const filtered = component.filteredAppointments;
    expect(filtered.every(a => a.caseId.toLowerCase().includes('exp-2026-001'))).toBeTrue();
  });

  it('should filter appointments by search text matching locationKey', () => {
    component.filterForm.patchValue({ search: 'central' });
    const filtered = component.filteredAppointments;
    expect(filtered.length).toBeGreaterThan(0);
  });
});
