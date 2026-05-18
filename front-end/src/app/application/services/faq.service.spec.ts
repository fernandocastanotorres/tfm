import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FaqService } from './faq.service';
import { environment } from '../../../environments/environment';

describe('FaqService', () => {
  let service: FaqService;
  let httpMock: HttpTestingController;

  const mockCategoryRaw = {
    id: 'cat-1',
    categoryCode: 'general',
    categoryName: 'General Questions'
  };

  const mockFaqRaw = {
    id: 'faq-1',
    categoryCode: 'general',
    question: 'How do I submit a procedure?',
    answer: 'Navigate to the procedures section and click Start.'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FaqService]
    });
    service = TestBed.inject(FaqService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCategories', () => {
    it('should GET /citizen/public-content/faq/categories', (done) => {
      service.getCategories().subscribe({
        next: (categories) => {
          expect(categories.length).toBe(1);
          expect(categories[0].id).toBe('cat-1');
          expect(categories[0].code).toBe('general');
          expect(categories[0].name).toBe('General Questions');
          done();
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/faq/categories`
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockCategoryRaw]);
    });

    it('should map category fields correctly', (done) => {
      service.getCategories().subscribe({
        next: (categories) => {
          const cat = categories[0];
          expect(cat.icon).toBe('info');
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/faq/categories`
      ).flush([mockCategoryRaw]);
    });

    it('should return empty array when no categories', (done) => {
      service.getCategories().subscribe({
        next: (categories) => {
          expect(categories).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/faq/categories`
      ).flush([]);
    });
  });

  describe('getFaqsByCategory', () => {
    it('should GET /citizen/public-content/faq with category filter', (done) => {
      service.getFaqsByCategory('general').subscribe({
        next: (faqs) => {
          expect(faqs.length).toBe(1);
          expect(faqs[0].id).toBe('faq-1');
          done();
        }
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/faq`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('category')).toBe('general');
      req.flush([mockFaqRaw]);
    });

    it('should not add category param when categoryId is "all"', (done) => {
      service.getFaqsByCategory('all').subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/faq`
      );
      expect(req.request.params.has('category')).toBeFalse();
      req.flush([]);
    });

    it('should map FAQ fields correctly', (done) => {
      service.getFaqsByCategory('general').subscribe({
        next: (faqs) => {
          const faq = faqs[0];
          expect(faq.categoryCode).toBe('general');
          expect(faq.question).toBe('How do I submit a procedure?');
          expect(faq.answer).toBe('Navigate to the procedures section and click Start.');
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/faq`
      ).flush([mockFaqRaw]);
    });
  });

  describe('searchFaqs', () => {
    it('should GET /citizen/public-content/faq with search query', (done) => {
      service.searchFaqs('procedure').subscribe({
        next: (faqs) => {
          expect(faqs.length).toBe(1);
          done();
        }
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/faq`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('q')).toBe('procedure');
      req.flush([mockFaqRaw]);
    });

    it('should return empty array when no results', (done) => {
      service.searchFaqs('nonexistent').subscribe({
        next: (faqs) => {
          expect(faqs).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/faq`
      ).flush([]);
    });
  });

  describe('error handling', () => {
    it('should propagate HTTP errors from getCategories', (done) => {
      service.getCategories().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/faq/categories`
      ).flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });

    it('should propagate HTTP errors from searchFaqs', (done) => {
      service.searchFaqs('test').subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/faq`
      ).flush({ message: 'Bad request' }, { status: 400, statusText: 'Bad Request' });
    });
  });
});
