import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { CalendarComponent } from './calendar.component';
import { CalendarService } from '../../../application/services/calendar.service';
import { I18nService } from '../../../application/services/i18n.service';
import { of, Subject } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;
  let calendarService: jasmine.SpyObj<CalendarService>;
  let i18nService: I18nService;

  const mockEvents: { id: string; title: string; date: string; type: 'deadline' | 'holiday' | 'info' | 'reminder'; description: string; relatedProcedure?: string }[] = [
    { id: '1', title: 'Tax Deadline', date: '2026-06-30', type: 'deadline', description: 'Tax filing deadline', relatedProcedure: undefined },
    { id: '2', title: 'National Holiday', date: '2026-10-12', type: 'holiday', description: 'National day', relatedProcedure: undefined }
  ];

  beforeEach(async () => {
    calendarService = jasmine.createSpyObj('CalendarService', ['getByType']);
    calendarService.getByType.and.returnValue(of(mockEvents));

    await TestBed.configureTestingModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [TranslateModule.forRoot(), RouterTestingModule, CalendarComponent],
    providers: [
        { provide: CalendarService, useValue: calendarService },
        I18nService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    i18nService = TestBed.inject(I18nService);
    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load events on init', () => {
    fixture.detectChanges();
    expect(calendarService.getByType).toHaveBeenCalledWith('all');
    expect(component.events.length).toBe(2);
    expect(component.isLoading).toBeFalse();
  });

  it('should sort events by date', () => {
    fixture.detectChanges();
    expect(component.events[0].date).toBe('2026-06-30');
  });

  it('should change type and reload', () => {
    fixture.detectChanges();
    component.onTypeChange('holiday');
    expect(calendarService.getByType).toHaveBeenCalledWith('holiday');
    expect(component.selectedType).toBe('holiday');
  });

  it('should return correct type class for deadline', () => {
    expect(component.getTypeClass('deadline')).toBe('calendar__type--deadline');
  });

  it('should return correct type class for holiday', () => {
    expect(component.getTypeClass('holiday')).toBe('calendar__type--holiday');
  });

  it('should return empty string for unknown type', () => {
    expect(component.getTypeClass('unknown')).toBe('');
  });

  it('should format date correctly', () => {
    const result = component.formatDate('2026-06-30');
    expect(result).toContain('2026');
  });
});
