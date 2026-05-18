import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LegislationService } from './legislation.service';
import { environment } from '../../../environments/environment';

describe('LegislationService', () => {
  let service: LegislationService;
  let httpMock: HttpTestingController;

  const mockLegislationRaw = {
    id: 'leg-1',
    title: 'Law 39/2015',
    type: 'law',
    publicationDate: '2015-10-01',
    description: 'Administrative procedure law',
    externalUrl: 'https://example.com/law',
    downloadUrl: 'https://example.com/law.pdf'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LegislationService]
    });
    service = TestBed.inject(LegislationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should GET /citizen/public-content/legislation', (done) => {
      service.getAll().subscribe({
        next: (items) => {
          expect(items.length).toBe(1);
          expect(items[0].id).toBe('leg-1');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/public-content/legislation`);
      expect(req.request.method).toBe('GET');
      req.flush([mockLegislationRaw]);
    });

    it('should map legislation fields correctly', (done) => {
      service.getAll().subscribe({
        next: (items) => {
          const item = items[0];
          expect(item.title).toBe('Law 39/2015');
          expect(item.type).toBe('law');
          expect(item.date).toBe('2015-10-01');
          expect(item.description).toBe('Administrative procedure law');
          expect(item.externalUrl).toBe('https://example.com/law');
          expect(item.downloadUrl).toBe('https://example.com/law.pdf');
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/legislation`
      ).flush([mockLegislationRaw]);
    });

    it('should return empty array when no legislation', (done) => {
      service.getAll().subscribe({
        next: (items) => {
          expect(items).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/legislation`
      ).flush([]);
    });
  });

  describe('getByType', () => {
    it('should GET with type filter when type is not "all"', (done) => {
      service.getByType('law').subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/legislation`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('type')).toBe('law');
      req.flush([]);
    });

    it('should GET without type filter when type is "all"', (done) => {
      service.getByType('all').subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/legislation`
      );
      expect(req.request.params.has('type')).toBeFalse();
      req.flush([]);
    });
  });

  describe('getTypes', () => {
    it('should return unique types with "all" prefix', (done) => {
      const items = [
        { id: '1', title: 'Law 1', type: 'law', publicationDate: '2020-01-01', description: '', externalUrl: '', downloadUrl: '' },
        { id: '2', title: 'Decree 1', type: 'decree', publicationDate: '2020-01-01', description: '', externalUrl: '', downloadUrl: '' },
        { id: '3', title: 'Law 2', type: 'law', publicationDate: '2020-01-01', description: '', externalUrl: '', downloadUrl: '' }
      ];

      service.getTypes().subscribe({
        next: (types) => {
          expect(types).toContain('all');
          expect(types).toContain('law');
          expect(types).toContain('decree');
          expect(types.length).toBe(3);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/legislation`
      ).flush(items);
    });

    it('should return only "all" when no legislation', (done) => {
      service.getTypes().subscribe({
        next: (types) => {
          expect(types).toEqual(['all']);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/legislation`
      ).flush([]);
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
        `${environment.apiBaseUrl}/citizen/public-content/legislation`
      ).flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });
});
