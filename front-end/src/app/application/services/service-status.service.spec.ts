import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ServiceStatusService } from './service-status.service';
import { of } from 'rxjs';

describe('ServiceStatusService', () => {
  let service: ServiceStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ServiceStatusService]
    });
    service = TestBed.inject(ServiceStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllStatus', () => {
    it('should return an Observable of ServiceStatusItem[]', (done) => {
      service.getAllStatus().subscribe({
        next: (services) => {
          expect(Array.isArray(services)).toBeTrue();
          expect(services.length).toBeGreaterThan(0);
          done();
        }
      });
    });

    it('should return services with required properties', (done) => {
      service.getAllStatus().subscribe({
        next: (services) => {
          const item = services[0];
          expect(item.id).toBeDefined();
          expect(item.nameKey).toBeDefined();
          expect(item.status).toBeDefined();
          expect(item.descriptionKey).toBeDefined();
          expect(item.lastUpdated).toBeDefined();
          done();
        }
      });
    });

    it('should return services with valid status values', (done) => {
      service.getAllStatus().subscribe({
        next: (services) => {
          const validStatuses = ['operational', 'degraded', 'maintenance', 'down'];
          for (const item of services) {
            expect(validStatuses).toContain(item.status);
          }
          done();
        }
      });
    });

    it('should return multiple services', (done) => {
      service.getAllStatus().subscribe({
        next: (services) => {
          expect(services.length).toBeGreaterThanOrEqual(5);
          done();
        }
      });
    });

    it('should have services with unique IDs', (done) => {
      service.getAllStatus().subscribe({
        next: (services) => {
          const ids = services.map(s => s.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
          done();
        }
      });
    });

    it('should emit after a delay', fakeAsync(() => {
      let emitted = false;
      service.getAllStatus().subscribe({
        next: () => { emitted = true; }
      });
      expect(emitted).toBeFalse();
      tick(300);
      expect(emitted).toBeTrue();
    }));
  });

  describe('getStatusById', () => {
    it('should return the matching service status', (done) => {
      service.getStatusById('auth').subscribe({
        next: (status) => {
          expect(status).toBeDefined();
          expect(status!.id).toBe('auth');
          done();
        }
      });
    });

    it('should return undefined when service not found', (done) => {
      service.getStatusById('nonexistent').subscribe({
        next: (status) => {
          expect(status).toBeUndefined();
          done();
        }
      });
    });

    it('should emit after a delay', fakeAsync(() => {
      let emitted = false;
      service.getStatusById('auth').subscribe({
        next: () => { emitted = true; }
      });
      expect(emitted).toBeFalse();
      tick(300);
      expect(emitted).toBeTrue();
    }));
  });

  describe('getOperationalCount', () => {
    it('should return the count of operational services', (done) => {
      service.getOperationalCount().subscribe({
        next: (count) => {
          expect(typeof count).toBe('number');
          expect(count).toBeGreaterThan(0);
          done();
        }
      });
    });

    it('should return correct count matching operational services', (done) => {
      service.getAllStatus().subscribe({
        next: (services) => {
          const expectedCount = services.filter(s => s.status === 'operational').length;
          service.getOperationalCount().subscribe({
            next: (count) => {
              expect(count).toBe(expectedCount);
              done();
            }
          });
        }
      });
    });

    it('should emit after a delay', fakeAsync(() => {
      let emitted = false;
      service.getOperationalCount().subscribe({
        next: () => { emitted = true; }
      });
      expect(emitted).toBeFalse();
      tick(300);
      expect(emitted).toBeTrue();
    }));
  });
});
