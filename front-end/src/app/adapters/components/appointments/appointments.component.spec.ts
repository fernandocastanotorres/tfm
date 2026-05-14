import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsComponent } from './appointments.component';
import { AppointmentsService } from '../../../application/services/appointments.service';
import { TranslateModule } from '@ngx-translate/core';

describe('AppointmentsComponent', () => {
  let component: AppointmentsComponent;
  let fixture: ComponentFixture<AppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppointmentsComponent],
      imports: [TranslateModule.forRoot()],
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
});
