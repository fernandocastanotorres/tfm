import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { UserManagementService } from './user-management.service';
import { environment } from '../../../environments/environment';

describe('UserManagementService', () => {
  let service: UserManagementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserManagementService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UserManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch user list via GET', () => {
    const mockUsers = [
      { id: '1', email: 'admin@tfm.es', roles: ['ROLE_ADMIN'], createdAt: '2024-01-01', lastLogin: null, isActive: true }
    ];

    service.list().subscribe((users) => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should create user via POST', () => {
    const request = { email: 'new@tfm.es', password: 'pass123', roles: ['ROLE_CITIZEN'], isActive: true };
    const mockResponse = { id: '2', email: 'new@tfm.es', roles: ['ROLE_CITIZEN'], createdAt: '2024-01-01', lastLogin: null, isActive: true };

    service.create(request).subscribe((user) => {
      expect(user).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/users`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockResponse);
  });

  it('should update user via PUT', () => {
    const id = 'user-1';
    const request = { email: 'updated@tfm.es', roles: ['ROLE_ADMIN'], isActive: true };
    const mockResponse = { id, email: 'updated@tfm.es', roles: ['ROLE_ADMIN'], createdAt: '2024-01-01', lastLogin: null, isActive: true };

    service.update(id, request).subscribe((user) => {
      expect(user).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/users/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(mockResponse);
  });

  it('should toggle user active status via PATCH', () => {
    const id = 'user-1';
    const mockResponse = { id, email: 'user@tfm.es', roles: ['ROLE_CITIZEN'], createdAt: '2024-01-01', lastLogin: null, isActive: false };

    service.toggleActive(id, false).subscribe((user) => {
      expect(user.isActive).toBeFalse();
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/users/${id}/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ isActive: false });
    req.flush(mockResponse);
  });
});
