import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ServiceStatusComponent } from './service-status.component';
import { ServiceStatusService } from '../../../application/services/service-status.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ServiceStatusComponent', () => {
  let component: ServiceStatusComponent;
  let fixture: ComponentFixture<ServiceStatusComponent>;
  let serviceStatusService: jasmine.SpyObj<ServiceStatusService>;

  const mockServices = [
    { id: '1', nameKey: 'SERVICE_STATUS.API_GATEWAY', status: 'operational' as const, descriptionKey: 'SERVICE_STATUS.API_GATEWAY_DESC', lastUpdated: '2026-05-19T10:00:00' },
    { id: '2', nameKey: 'SERVICE_STATUS.DOCUMENT_SERVICE', status: 'degraded' as const, descriptionKey: 'SERVICE_STATUS.DOCUMENT_SERVICE_DESC', lastUpdated: '2026-05-19T09:30:00' }
  ];

  beforeEach(async () => {
    serviceStatusService = jasmine.createSpyObj('ServiceStatusService', ['getAllStatus', 'getOperationalCount']);
    serviceStatusService.getAllStatus.and.returnValue(of(mockServices));
    serviceStatusService.getOperationalCount.and.returnValue(of(1));

    await TestBed.configureTestingModule({
    declarations: [ServiceStatusComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [TranslateModule.forRoot(), RouterTestingModule],
    providers: [
        { provide: ServiceStatusService, useValue: serviceStatusService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ServiceStatusComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load services and operational count on init', () => {
    fixture.detectChanges();
    expect(serviceStatusService.getAllStatus).toHaveBeenCalled();
    expect(serviceStatusService.getOperationalCount).toHaveBeenCalled();
    expect(component.services.length).toBe(2);
    expect(component.operationalCount).toBe(1);
    expect(component.isLoading).toBeFalse();
  });

  it('should return correct label for operational', () => {
    expect(component.getStatusLabel('operational')).toBe('SERVICE_STATUS.STATUS_OPERATIONAL');
  });

  it('should return correct label for degraded', () => {
    expect(component.getStatusLabel('degraded')).toBe('SERVICE_STATUS.STATUS_DEGRADED');
  });

  it('should return correct label for down', () => {
    expect(component.getStatusLabel('down')).toBe('SERVICE_STATUS.STATUS_DOWN');
  });

  it('should return correct label for maintenance', () => {
    expect(component.getStatusLabel('maintenance')).toBe('SERVICE_STATUS.STATUS_MAINTENANCE');
  });

  it('should return status as-is for unknown status', () => {
    expect(component.getStatusLabel('unknown')).toBe('unknown');
  });

  it('should return correct class for operational', () => {
    expect(component.getStatusClass('operational')).toBe('service-status__indicator--operational');
  });

  it('should return correct class for degraded', () => {
    expect(component.getStatusClass('degraded')).toBe('service-status__indicator--degraded');
  });

  it('should return correct class for down', () => {
    expect(component.getStatusClass('down')).toBe('service-status__indicator--down');
  });

  it('should return correct class for maintenance', () => {
    expect(component.getStatusClass('maintenance')).toBe('service-status__indicator--maintenance');
  });

  it('should return empty string for unknown status class', () => {
    expect(component.getStatusClass('unknown')).toBe('');
  });

  it('should format date correctly', () => {
    const result = component.formatDate('2026-05-19T10:00:00');
    expect(result).toContain('may');
  });
});
