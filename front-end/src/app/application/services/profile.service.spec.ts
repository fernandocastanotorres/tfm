import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService, ProfileData } from './profile.service';
import { environment } from '../../../environments/environment';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  const mockProfile: ProfileData = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+34 600 123 456',
    nationalId: '12345678A',
    address: 'Calle Mayor 1, Madrid'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProfileService]
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProfile', () => {
    it('should GET /auth/me', (done) => {
      service.getProfile().subscribe({
        next: (profile) => {
          expect(profile.fullName).toBe('John Doe');
          expect(profile.email).toBe('john@example.com');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });

    it('should propagate HTTP errors', (done) => {
      service.getProfile().subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/auth/me`
      ).flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('updateProfile', () => {
    it('should PUT /auth/me with profile data excluding email', (done) => {
      const updateData = {
        fullName: 'Jane Doe',
        phone: '+34 600 999 999',
        nationalId: '87654321B',
        address: 'Calle Nueva 2, Barcelona'
      };

      service.updateProfile(updateData).subscribe({
        next: (profile) => {
          expect(profile.fullName).toBe('Jane Doe');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/me`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush({ ...mockProfile, ...updateData });
    });

    it('should propagate HTTP errors', (done) => {
      service.updateProfile({ fullName: 'Test', phone: '', nationalId: '', address: '' }).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/auth/me`
      ).flush({ message: 'Bad request' }, { status: 400, statusText: 'Bad Request' });
    });
  });
});
