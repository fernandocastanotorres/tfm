import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ElectronicNotificationService } from './electronic-notification.service';
import { environment } from '../../../environments/environment';

describe('ElectronicNotificationService', () => {
  let service: ElectronicNotificationService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiBaseUrl}/admin`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ElectronicNotificationService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ElectronicNotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list citizens via GET without search', () => {
    const mockCitizens = [{ id: 'c1', email: 'citizen@test.com', displayName: 'John', nationalId: null }];

    service.listCitizens().subscribe((citizens) => {
      expect(citizens).toEqual(mockCitizens);
    });

    const req = httpMock.expectOne(`${baseUrl}/notifications/citizens`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCitizens);
  });

  it('should list citizens via GET with search query', () => {
    const mockCitizens = [{ id: 'c1', email: 'john@test.com', displayName: 'John Doe', nationalId: '12345' }];

    service.listCitizens('John').subscribe((citizens) => {
      expect(citizens).toEqual(mockCitizens);
    });

    const req = httpMock.expectOne(`${baseUrl}/notifications/citizens?search=John`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCitizens);
  });

  it('should list citizen cases via GET', () => {
    const mockCases = [{ id: 'case-1', title: 'Test Case', procedureType: 'LICENCIA', status: 'OPEN', createdAt: '2024-01-01' }];

    service.listCitizenCases('c1').subscribe((cases) => {
      expect(cases).toEqual(mockCases);
    });

    const req = httpMock.expectOne(`${baseUrl}/notifications/citizens/c1/cases`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCases);
  });

  it('should list all notifications via GET with default pagination', () => {
    const mockPage = { items: [], page: 0, size: 10, totalItems: 0, totalPages: 0 };

    service.listAllNotifications(0, 10).subscribe((page) => {
      expect(page).toEqual(mockPage);
    });

    const req = httpMock.expectOne(`${baseUrl}/notifications/formal?page=0&size=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('should list all notifications with status filter', () => {
    const mockPage = { items: [], page: 0, size: 10, totalItems: 0, totalPages: 0 };

    service.listAllNotifications(0, 10, 'PENDING').subscribe((page) => {
      expect(page).toEqual(mockPage);
    });

    const req = httpMock.expectOne(`${baseUrl}/notifications/formal?page=0&size=10&status=PENDING`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('should send formal notification via POST with FormData', () => {
    const mockNotification = { id: 'n1', citizenId: 'c1', procedureId: 'p1', caseTitle: 'Test', status: 'SENT', typeKey: 'TPL_001', subject: 'Subject', body: 'Body', availableAt: '2024-01-01', expiresAt: '2024-02-01', accessedAt: null, resolvedAt: null, expiredAt: null, attachments: [] };
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });

    service.sendFormalNotification('c1', 'p1', 'TPL_001', 'Subject', 'Body', 7, true, [file]).subscribe((n) => {
      expect(n).toEqual(mockNotification);
    });

    const req = httpMock.expectOne(`${baseUrl}/notifications/formal`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(mockNotification);
  });
});
