import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ThemePaletteService } from './theme-palette.service';
import { environment } from '../../../environments/environment';

describe('ThemePaletteService', () => {
  let service: ThemePaletteService;
  let httpMock: HttpTestingController;

  const mockPalette = {
    colors: [
      { token: '--primary-color', value: '#0055aa' },
      { token: '--secondary-color', value: '#00aa55' }
    ],
    updatedAt: '2026-05-01T00:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ThemePaletteService]
    });
    service = TestBed.inject(ThemePaletteService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clean up CSS custom properties before each test
    const root = document.documentElement;
    root.style.removeProperty('--primary-color');
    root.style.removeProperty('--secondary-color');
    root.style.removeProperty('--primary-color-dark');
    root.style.removeProperty('--secondary-color-dark');
  });

  afterEach(() => {
    httpMock.verify();

    // Clean up CSS custom properties after each test
    const root = document.documentElement;
    root.style.removeProperty('--primary-color');
    root.style.removeProperty('--secondary-color');
    root.style.removeProperty('--primary-color-dark');
    root.style.removeProperty('--secondary-color-dark');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadAndApply', () => {
    it('should GET /citizen/public-content/theme with ts parameter', (done) => {
      service.loadAndApply().subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/theme`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.has('ts')).toBeTrue();
      req.flush(mockPalette);
    });

    it('should apply CSS custom properties from palette', (done) => {
      service.loadAndApply().subscribe({
        next: () => {
          const root = document.documentElement;
          expect(root.style.getPropertyValue('--primary-color').trim()).toBe('#0055aa');
          expect(root.style.getPropertyValue('--secondary-color').trim()).toBe('#00aa55');
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/theme`
      ).flush(mockPalette);
    });

    it('should return the palette', (done) => {
      service.loadAndApply().subscribe({
        next: (palette) => {
          expect(palette).toEqual(mockPalette);
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/theme`
      ).flush(mockPalette);
    });

    it('should return null on HTTP error', (done) => {
      service.loadAndApply().subscribe({
        next: (palette) => {
          expect(palette).toBeNull();
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/theme`
      ).flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });

    it('should remove previously applied tokens before applying new ones', (done) => {
      // First load
      service.loadAndApply().subscribe({
        next: () => {
          const root = document.documentElement;
          expect(root.style.getPropertyValue('--primary-color').trim()).toBe('#0055aa');

          // Second load with different values
          const newPalette = {
            colors: [
              { token: '--primary-color', value: '#ff0000' }
            ],
            updatedAt: '2026-05-02T00:00:00Z'
          };

          service.loadAndApply().subscribe({
            next: () => {
              expect(root.style.getPropertyValue('--primary-color').trim()).toBe('#ff0000');
              expect(root.style.getPropertyValue('--secondary-color').trim()).toBe('');
              done();
            }
          });

          httpMock.expectOne(
            (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/theme`
          ).flush(newPalette);
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/theme`
      ).flush(mockPalette);
    });

    it('should generate dark variants for tokens', (done) => {
      const palette = {
        colors: [
          { token: '--primary', value: '#0055aa' }
        ],
        updatedAt: '2026-05-01T00:00:00Z'
      };

      service.loadAndApply().subscribe({
        next: () => {
          const root = document.documentElement;
          expect(root.style.getPropertyValue('--primary').trim()).toBe('#0055aa');
          expect(root.style.getPropertyValue('--primary-dark').trim()).toBe('#0055aa');
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/theme`
      ).flush(palette);
    });

    it('should not duplicate dark variants for tokens that already end with -dark', (done) => {
      const palette = {
        colors: [
          { token: '--primary-dark', value: '#003366' }
        ],
        updatedAt: '2026-05-01T00:00:00Z'
      };

      service.loadAndApply().subscribe({
        next: () => {
          const root = document.documentElement;
          expect(root.style.getPropertyValue('--primary-dark').trim()).toBe('#003366');
          expect(root.style.getPropertyValue('--primary-dark-dark').trim()).toBe('');
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/theme`
      ).flush(palette);
    });

    it('should handle empty colors array', (done) => {
      service.loadAndApply().subscribe({
        next: () => {
          const root = document.documentElement;
          expect(root.style.getPropertyValue('--primary-color').trim()).toBe('');
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/theme`
      ).flush({ colors: [], updatedAt: null });
    });

    it('should skip colors with missing token or value', (done) => {
      const palette = {
        colors: [
          { token: '--valid', value: '#000000' },
          { token: '', value: '#000000' },
          { token: '--no-value', value: '' }
        ]
      };

      service.loadAndApply().subscribe({
        next: () => {
          const root = document.documentElement;
          expect(root.style.getPropertyValue('--valid').trim()).toBe('#000000');
          expect(root.style.getPropertyValue('--no-value').trim()).toBe('');
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/theme`
      ).flush(palette);
    });

    it('should deduplicate tokens by keeping first occurrence', (done) => {
      const palette = {
        colors: [
          { token: '--primary', value: '#000000' },
          { token: '--primary', value: '#ffffff' }
        ]
      };

      service.loadAndApply().subscribe({
        next: () => {
          const root = document.documentElement;
          expect(root.style.getPropertyValue('--primary').trim()).toBe('#000000');
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/public-content/theme`
      ).flush(palette);
    });
  });
});
