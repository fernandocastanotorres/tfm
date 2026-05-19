import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ServiceStatusService } from './service-status.service';

describe('ServiceStatusService', () => {
  let service: ServiceStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ServiceStatusService] });
    service = TestBed.inject(ServiceStatusService);
  });

  it('should be created', () => { expect(service).toBeTruthy(); });

  describe('getAllStatus', () => {
    it('should return all service statuses', fakeAsync(() => {
      let result: any;
      service.getAllStatus().subscribe(statuses => { result = statuses; });
      tick(300);
      expect(result.length).toBe(8);
    }));
  });

  describe('getStatusById', () => {
    it('should return status for known service', fakeAsync(() => {
      let result: any;
      service.getStatusById('auth').subscribe(status => { result = status; });
      tick(300);
      expect(result.id).toBe('auth');
      expect(result.status).toBe('operational');
    }));

    it('should return undefined for unknown service', fakeAsync(() => {
      let result: any;
      service.getStatusById('unknown').subscribe(status => { result = status; });
      tick(300);
      expect(result).toBeUndefined();
    }));
  });

  describe('getOperationalCount', () => {
    it('should return count of operational services', fakeAsync(() => {
      let result = 0;
      service.getOperationalCount().subscribe(count => { result = count; });
      tick(300);
      expect(result).toBeGreaterThan(0);
    }));
  });
});
