import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CalendarService } from './calendar.service';
import { environment } from '../../../environments/environment';

describe('CalendarService', () => {
  let service: CalendarService;
  let httpMock: HttpTestingController;

  const mockEventRaw = {
    id: 'evt-1',
    title: 'Town Hall Meeting',
    eventDate: '2026-06-01T10:00:00Z',
    type: 'meeting',
    description: 'Monthly town hall',
    relatedProcedure: 'proc-1'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CalendarService]
    });
    service = TestBed.inject(CalendarService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should GET /citizen/public-content/calendar', (done) => {
      service.getAll().subscribe({
        next: (events) => {
          expect(events.length).toBe(1);
          expect(events[0].id).toBe('evt-1');
          expect(events[0].title).toBe('Town Hall Meeting');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/public-content/calendar`);
      expect(req.request.method).toBe('GET');
      req.flush([mockEventRaw]);
    });

    it('should map event fields correctly', (done) => {
      service.getAll().subscribe({
        next: (events) => {
          expect(events[0].date).toBe('2026-06-01T10:00:00Z');
          expect(events[0].type).toBe('meeting');
          expect(events[0].relatedProcedure).toBe('proc-1');
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/calendar`
      ).flush([mockEventRaw]);
    });

    it('should return empty array when no events', (done) => {
      service.getAll().subscribe({
        next: (events) => {
          expect(events).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/calendar`
      ).flush([]);
    });
  });

  describe('getByType', () => {
    it('should GET with type filter when type is not "all"', (done) => {
      service.getByType('meeting').subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/calendar`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('type')).toBe('meeting');
      req.flush([]);
    });

    it('should GET without type filter when type is "all"', (done) => {
      service.getByType('all').subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/calendar`
      );
      expect(req.request.params.has('type')).toBeFalse();
      req.flush([]);
    });
  });

  describe('getUpcoming', () => {
    it('should GET with upcomingLimit parameter', (done) => {
      service.getUpcoming(3).subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/calendar`
      );
      expect(req.request.params.get('upcomingLimit')).toBe('3');
      req.flush([]);
    });

    it('should use default limit of 5', (done) => {
      service.getUpcoming().subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/calendar`
      );
      expect(req.request.params.get('upcomingLimit')).toBe('5');
      req.flush([]);
    });
  });

  describe('error handling', () => {
    it('should propagate HTTP errors from getAll', (done) => {
      service.getAll().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/calendar`
      ).flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });
});
