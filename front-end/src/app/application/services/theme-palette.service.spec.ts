import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ThemePaletteService } from './theme-palette.service';
import { ThemePalette } from '../models/sede.models';
import { environment } from '../../../environments/environment';

describe('ThemePaletteService', () => {
  let service: ThemePaletteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ThemePaletteService]
    });
    service = TestBed.inject(ThemePaletteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    // Clean up CSS custom properties after each test
    document.documentElement.style.cssText = '';
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadAndApply', () => {
    it('should fetch theme palette from API endpoint', (done) => {
      const mockPalette: ThemePalette = {
        colors: [{ token: '--primary', value: '#0055aa' }],
        updatedAt: '2025-01-01T00:00:00Z'
      };

      service.loadAndApply().subscribe({
        next: (palette) => {
          expect(palette).toEqual(mockPalette);
          done();
        }
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${environment.apiBaseUrl}/citizen/public-content/theme`
        && request.params.has('ts')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPalette);
    });

    it('should apply palette CSS properties to document on success', (done) => {
      // Duplicate token triggers -dark variant creation in normalizeColors
      const mockPalette: ThemePalette = {
        colors: [
          { token: '--primary', value: '#0055aa' },
          { token: '--primary', value: '#0055aa' }
        ],
        updatedAt: '2025-01-01T00:00:00Z'
      };

      service.loadAndApply().subscribe({
        next: () => {
          const root = document.documentElement;
          expect(root.style.getPropertyValue('--primary').trim()).toBe('#0055aa');
          expect(root.style.getPropertyValue('--primary-dark').trim()).toBe('#0055aa');
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('public-content/theme')).flush(mockPalette);
    });

    it('should return null on API error', (done) => {
      service.loadAndApply().subscribe({
        next: (palette) => {
          expect(palette).toBeNull();
          done();
        }
      });

      const req = httpMock.expectOne((r) => r.url.includes('public-content/theme'));
      req.error(new ProgressEvent('Network error'));
    });
  });

  describe('applyPalette', () => {
    it('should set CSS custom properties on document.documentElement', () => {
      // Duplicate tokens trigger -dark variant creation
      const palette: ThemePalette = {
        colors: [
          { token: '--primary', value: '#0055aa' },
          { token: '--primary', value: '#0055aa' },
          { token: '--secondary', value: '#ff6600' },
          { token: '--secondary', value: '#ff6600' }
        ],
        updatedAt: null
      };

      (service as any).applyPalette(palette);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--primary').trim()).toBe('#0055aa');
      expect(root.style.getPropertyValue('--primary-dark').trim()).toBe('#0055aa');
      expect(root.style.getPropertyValue('--secondary').trim()).toBe('#ff6600');
      expect(root.style.getPropertyValue('--secondary-dark').trim()).toBe('#ff6600');
    });

    it('should remove previously applied tokens before applying new ones', () => {
      // Apply first palette with duplicates to create -dark variants
      const firstPalette: ThemePalette = {
        colors: [
          { token: '--old-color', value: '#red' },
          { token: '--old-color', value: '#red' }
        ],
        updatedAt: null
      };
      (service as any).applyPalette(firstPalette);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--old-color').trim()).toBe('#red');
      expect(root.style.getPropertyValue('--old-color-dark').trim()).toBe('#red');

      // Apply second palette with duplicates
      const secondPalette: ThemePalette = {
        colors: [
          { token: '--new-color', value: '#blue' },
          { token: '--new-color', value: '#blue' }
        ],
        updatedAt: null
      };
      (service as any).applyPalette(secondPalette);

      // Old tokens should be removed
      expect(root.style.getPropertyValue('--old-color')).toBe('');
      expect(root.style.getPropertyValue('--old-color-dark')).toBe('');
      // New tokens should be set
      expect(root.style.getPropertyValue('--new-color').trim()).toBe('#blue');
      expect(root.style.getPropertyValue('--new-color-dark').trim()).toBe('#blue');
    });

    it('should do nothing when palette is null', () => {
      const root = document.documentElement;
      root.style.setProperty('--existing', 'value');

      (service as any).applyPalette(null);

      expect(root.style.getPropertyValue('--existing').trim()).toBe('value');
    });

    it('should do nothing when palette.colors is not an array', () => {
      const root = document.documentElement;
      root.style.setProperty('--existing', 'value');

      const invalidPalette = { colors: null, updatedAt: null };
      (service as any).applyPalette(invalidPalette);

      expect(root.style.getPropertyValue('--existing').trim()).toBe('value');
    });
  });

  describe('normalizeColors', () => {
    it('should deduplicate colors by token and create -dark for duplicates', () => {
      const colors = [
        { token: '--primary', value: '#0055aa' },
        { token: '--primary', value: '#ff0000' },
        { token: '--secondary', value: '#00ff00' }
      ];

      const result = (service as any).normalizeColors(colors);

      // --primary first occurrence + --primary-dark from duplicate (uses duplicate's value) + --secondary
      expect(result.length).toBe(3);
      expect(result[0]).toEqual({ token: '--primary', value: '#0055aa' });
      expect(result[1]).toEqual({ token: '--primary-dark', value: '#ff0000' });
      expect(result[2]).toEqual({ token: '--secondary', value: '#00ff00' });
    });

    it('should create -dark variant only when token is duplicated', () => {
      const colors = [
        { token: '--primary', value: '#0055aa' },
        { token: '--primary', value: '#0055aa' }
      ];

      const result = (service as any).normalizeColors(colors);

      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ token: '--primary', value: '#0055aa' });
      expect(result[1]).toEqual({ token: '--primary-dark', value: '#0055aa' });
    });

    it('should NOT create -dark variant for tokens already ending in -dark', () => {
      const colors = [
        { token: '--primary-dark', value: '#003366' },
        { token: '--primary-dark', value: '#003366' }
      ];

      const result = (service as any).normalizeColors(colors);

      // Duplicate of -dark token: no further -dark-dark variant created
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({ token: '--primary-dark', value: '#003366' });
    });

    it('should filter out colors with empty token or value', () => {
      const colors = [
        { token: '--primary', value: '#0055aa' },
        { token: '', value: '#ff0000' },
        { token: '--empty-value', value: '' },
        { token: '  ', value: '#00ff00' },
        { token: '--whitespace-value', value: '  ' }
      ];

      const result = (service as any).normalizeColors(colors);

      // Only the valid --primary entry survives (no duplicate, so no -dark)
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({ token: '--primary', value: '#0055aa' });
    });

    it('should filter out null/undefined color entries', () => {
      const colors = [
        { token: '--primary', value: '#0055aa' },
        null,
        undefined,
        { token: '--secondary', value: '#ff6600' }
      ] as any[];

      const result = (service as any).normalizeColors(colors);

      // Two valid unique tokens, no duplicates so no -dark variants
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ token: '--primary', value: '#0055aa' });
      expect(result[1]).toEqual({ token: '--secondary', value: '#ff6600' });
    });
  });
});
