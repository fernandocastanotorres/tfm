import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrganismsService } from './organisms.service';
import { environment } from '../../../environments/environment';

describe('OrganismsService', () => {
  let service: OrganismsService;
  let httpMock: HttpTestingController;

  const mockOrganismRaw = {
    id: 'org-1',
    name: 'Urban Planning Office',
    description: 'Handles urban planning permits',
    categoryCode: 'urbanism',
    phone: '900 123 456',
    email: 'urbanism@example.com',
    address: 'Calle Mayor 1',
    websiteUrl: 'https://example.com'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrganismsService]
    });
    service = TestBed.inject(OrganismsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should GET /citizen/public-content/organisms', (done) => {
      service.getAll().subscribe({
        next: (organisms) => {
          expect(organisms.length).toBe(1);
          expect(organisms[0].id).toBe('org-1');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/public-content/organisms`);
      expect(req.request.method).toBe('GET');
      req.flush([mockOrganismRaw]);
    });

    it('should map organism fields correctly', (done) => {
      service.getAll().subscribe({
        next: (organisms) => {
          const org = organisms[0];
          expect(org.name).toBe('Urban Planning Office');
          expect(org.description).toBe('Handles urban planning permits');
          expect(org.category).toBe('urbanism');
          expect(org.phone).toBe('900 123 456');
          expect(org.email).toBe('urbanism@example.com');
          expect(org.address).toBe('Calle Mayor 1');
          expect(org.websiteUrl).toBe('https://example.com');
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/organisms`
      ).flush([mockOrganismRaw]);
    });

    it('should return empty array when no organisms', (done) => {
      service.getAll().subscribe({
        next: (organisms) => {
          expect(organisms).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/organisms`
      ).flush([]);
    });
  });

  describe('getByCategory', () => {
    it('should GET with category filter when category is not "all"', (done) => {
      service.getByCategory('urbanism').subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/organisms`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('category')).toBe('urbanism');
      req.flush([]);
    });

    it('should GET without category filter when category is "all"', (done) => {
      service.getByCategory('all').subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/organisms`
      );
      expect(req.request.params.has('category')).toBeFalse();
      req.flush([]);
    });
  });

  describe('getCategories', () => {
    it('should return unique categories with "all" prefix', (done) => {
      const organisms = [
        { id: '1', name: 'Org 1', description: '', categoryCode: 'urbanism', phone: '', email: '', address: '', websiteUrl: '' },
        { id: '2', name: 'Org 2', description: '', categoryCode: 'registry', phone: '', email: '', address: '', websiteUrl: '' },
        { id: '3', name: 'Org 3', description: '', categoryCode: 'urbanism', phone: '', email: '', address: '', websiteUrl: '' }
      ];

      service.getCategories().subscribe({
        next: (categories) => {
          expect(categories).toContain('all');
          expect(categories).toContain('urbanism');
          expect(categories).toContain('registry');
          expect(categories.length).toBe(3);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/organisms`
      ).flush(organisms);
    });

    it('should return only "all" when no organisms', (done) => {
      service.getCategories().subscribe({
        next: (categories) => {
          expect(categories).toEqual(['all']);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/organisms`
      ).flush([]);
    });
  });

  describe('search', () => {
    it('should GET with q parameter', (done) => {
      service.search('urban').subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/organisms`
      );
      expect(req.request.params.get('q')).toBe('urban');
      req.flush([]);
    });

    it('should return empty array when no results', (done) => {
      service.search('nonexistent').subscribe({
        next: (organisms) => {
          expect(organisms).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/organisms`
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
        `${environment.apiBaseUrl}/citizen/public-content/organisms`
      ).flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });
});
