import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GlossaryService } from './glossary.service';
import { environment } from '../../../environments/environment';

describe('GlossaryService', () => {
  let service: GlossaryService;
  let httpMock: HttpTestingController;

  const mockTermRaw = {
    id: 'term-1',
    title: 'API',
    description: 'Application Programming Interface',
    content: 'REST, SOAP, GraphQL'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GlossaryService]
    });
    service = TestBed.inject(GlossaryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should GET /citizen/public-content/resources with type=glossary', (done) => {
      service.getAll().subscribe({
        next: (terms) => {
          expect(terms.length).toBe(1);
          expect(terms[0].id).toBe('term-1');
          done();
        }
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/resources`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('type')).toBe('glossary');
      req.flush([mockTermRaw]);
    });

    it('should map term fields correctly', (done) => {
      service.getAll().subscribe({
        next: (terms) => {
          const term = terms[0];
          expect(term.term).toBe('API');
          expect(term.definition).toBe('Application Programming Interface');
          expect(term.relatedTerms).toEqual(['REST', 'SOAP', 'GraphQL']);
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/resources`
      ).flush([mockTermRaw]);
    });

    it('should return empty relatedTerms when content is empty', (done) => {
      const raw = { id: 'term-1', title: 'Term', description: 'Def', content: '' };

      service.getAll().subscribe({
        next: (terms) => {
          expect(terms[0].relatedTerms).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/resources`
      ).flush([raw]);
    });

    it('should return empty relatedTerms when content is null', (done) => {
      const raw = { id: 'term-1', title: 'Term', description: 'Def' };

      service.getAll().subscribe({
        next: (terms) => {
          expect(terms[0].relatedTerms).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/resources`
      ).flush([raw]);
    });
  });

  describe('search', () => {
    it('should GET with type=glossary and q parameter', (done) => {
      service.search('API').subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/resources`
      );
      expect(req.request.params.get('type')).toBe('glossary');
      expect(req.request.params.get('q')).toBe('API');
      req.flush([]);
    });
  });

  describe('getByLetter', () => {
    it('should filter terms by first letter', (done) => {
      const terms = [
        { id: '1', title: 'API', description: 'Def', content: '' },
        { id: '2', title: 'Backend', description: 'Def', content: '' },
        { id: '3', title: 'Application', description: 'Def', content: '' }
      ];

      service.getByLetter('A').subscribe({
        next: (filtered) => {
          expect(filtered.length).toBe(2);
          expect(filtered[0].term).toBe('API');
          expect(filtered[1].term).toBe('Application');
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/resources`
      ).flush(terms);
    });

    it('should be case-insensitive', (done) => {
      const terms = [
        { id: '1', title: 'api', description: 'Def', content: '' },
        { id: '2', title: 'Backend', description: 'Def', content: '' }
      ];

      service.getByLetter('a').subscribe({
        next: (filtered) => {
          expect(filtered.length).toBe(1);
          expect(filtered[0].term).toBe('api');
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/resources`
      ).flush(terms);
    });

    it('should return empty array when no terms match letter', (done) => {
      const terms = [
        { id: '1', title: 'Backend', description: 'Def', content: '' }
      ];

      service.getByLetter('Z').subscribe({
        next: (filtered) => {
          expect(filtered).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/resources`
      ).flush(terms);
    });
  });

  describe('getLetters', () => {
    it('should return sorted unique first letters', (done) => {
      const terms = [
        { id: '1', title: 'API', description: 'Def', content: '' },
        { id: '2', title: 'Backend', description: 'Def', content: '' },
        { id: '3', title: 'Application', description: 'Def', content: '' }
      ];

      service.getLetters().subscribe({
        next: (letters) => {
          expect(letters).toEqual(['A', 'B']);
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/resources`
      ).flush(terms);
    });

    it('should return empty array when no terms', (done) => {
      service.getLetters().subscribe({
        next: (letters) => {
          expect(letters).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/resources`
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
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/resources`
      ).flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });
});
