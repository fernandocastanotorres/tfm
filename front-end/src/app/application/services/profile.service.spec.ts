import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService, ProfileData } from './profile.service';
import { environment } from '../../../environments/environment';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

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
      const profile: ProfileData = { fullName: 'John Doe', email: 'john@test.com', phone: '123456789', nationalId: '12345678A', address: 'Main St 1' };

      service.getProfile().subscribe({
        next: (result) => {
          expect(result.fullName).toBe('John Doe');
          expect(result.email).toBe('john@test.com');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/me`);
      expect(req.request.method).toBe('GET');
      req.flush(profile);
    });
  });

  describe('updateProfile', () => {
    it('should PUT /auth/me', (done) => {
      const update = { fullName: 'Jane Doe', phone: '987654321', nationalId: '87654321B', address: 'New St 2' };

      service.updateProfile(update).subscribe({
        next: (result) => {
          expect(result.fullName).toBe('Jane Doe');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/me`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.fullName).toBe('Jane Doe');
      req.flush({ ...update, email: 'jane@test.com' });
    });
  });
});
