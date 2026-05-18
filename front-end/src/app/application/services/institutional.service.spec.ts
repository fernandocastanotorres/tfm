import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InstitutionalService } from './institutional.service';
import { environment } from '../../../environments/environment';

describe('InstitutionalService', () => {
  let service: InstitutionalService;
  let httpMock: HttpTestingController;

  const mockSectionRaw = {
    sectionCode: 'about',
    title: 'About Us',
    content: 'Information about the institution',
    icon: 'info'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InstitutionalService]
    });
    service = TestBed.inject(InstitutionalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllSections', () => {
    it('should GET /citizen/public-content/institutional', (done) => {
      service.getAllSections().subscribe({
        next: (sections) => {
          expect(sections.length).toBe(1);
          expect(sections[0].id).toBe('about');
          expect(sections[0].title).toBe('About Us');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/public-content/institutional`);
      expect(req.request.method).toBe('GET');
      req.flush([mockSectionRaw]);
    });

    it('should map section fields correctly', (done) => {
      service.getAllSections().subscribe({
        next: (sections) => {
          const section = sections[0];
          expect(section.id).toBe('about');
          expect(section.content).toBe('Information about the institution');
          expect(section.icon).toBe('info');
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/institutional`
      ).flush([mockSectionRaw]);
    });

    it('should return empty array when no sections', (done) => {
      service.getAllSections().subscribe({
        next: (sections) => {
          expect(sections).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/institutional`
      ).flush([]);
    });
  });

  describe('getSectionById', () => {
    it('should return the matching section', (done) => {
      const sections = [
        { sectionCode: 'about', title: 'About', content: 'About content', icon: 'info' },
        { sectionCode: 'mission', title: 'Mission', content: 'Mission content', icon: 'target' }
      ];

      service.getSectionById('mission').subscribe({
        next: (section) => {
          expect(section).toBeDefined();
          expect(section!.id).toBe('mission');
          expect(section!.title).toBe('Mission');
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/institutional`
      ).flush(sections);
    });

    it('should return undefined when section not found', (done) => {
      service.getSectionById('nonexistent').subscribe({
        next: (section) => {
          expect(section).toBeUndefined();
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/institutional`
      ).flush([]);
    });
  });

  describe('error handling', () => {
    it('should propagate HTTP errors from getAllSections', (done) => {
      service.getAllSections().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/institutional`
      ).flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });
});
