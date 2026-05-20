import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { PublicHomeComponent } from './public-home.component';
import { ProceduresApiService } from '../../../application/services/procedures-api.service';
import { CalendarService } from '../../../application/services/calendar.service';
import { I18nService } from '../../../application/services/i18n.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PublicHomeComponent', () => {
  let component: PublicHomeComponent;
  let fixture: ComponentFixture<PublicHomeComponent>;
  let proceduresApi: jasmine.SpyObj<ProceduresApiService>;
  let calendarService: jasmine.SpyObj<CalendarService>;

  const mockProcedures = [
    { id: '1', slug: 'license-a', name: 'License A', description: 'Desc 1', category: 'General', fee: 0, deadline: 30, status: 'active' },
    { id: '2', slug: 'license-b', name: 'License B', description: 'Desc 2', category: 'General', fee: 10, deadline: 15, status: 'active' }
  ];

  const mockEvents = [
    { id: '1', title: 'Event 1', date: '2026-06-01', type: 'deadline' as const, description: 'Desc', relatedProcedure: undefined }
  ];

  beforeEach(async () => {
    proceduresApi = jasmine.createSpyObj('ProceduresApiService', ['listAll']);
    calendarService = jasmine.createSpyObj('CalendarService', ['getUpcoming']);
    proceduresApi.listAll.and.returnValue(of(mockProcedures));
    calendarService.getUpcoming.and.returnValue(of(mockEvents));

    await TestBed.configureTestingModule({
    declarations: [PublicHomeComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [TranslateModule.forRoot(), RouterTestingModule],
    providers: [
        { provide: ProceduresApiService, useValue: proceduresApi },
        { provide: CalendarService, useValue: calendarService },
        I18nService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(PublicHomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load procedures and events on init', () => {
    fixture.detectChanges();
    expect(proceduresApi.listAll).toHaveBeenCalled();
    expect(calendarService.getUpcoming).toHaveBeenCalledWith(3);
    expect(component.procedures.length).toBe(2);
    expect(component.upcomingEvents.length).toBe(1);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle empty procedures list', () => {
    proceduresApi.listAll.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component.procedures.length).toBe(0);
    expect(component.isLoading).toBeFalse();
  });

  it('should set isLoading to false on procedure load error', () => {
    proceduresApi.listAll.and.returnValue(throwError(() => new Error('Network error')));
    fixture.detectChanges();
    expect(component.isLoading).toBeFalse();
  });

  it('should format date correctly', () => {
    const result = component.formatDate('2026-06-15');
    expect(result).toContain('2026');
  });
});
