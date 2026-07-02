import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ContactInboxService } from './contact-inbox.service';
import { environment } from '../../../environments/environment';

describe('ContactInboxService', () => {
  let service: ContactInboxService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ContactInboxService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ContactInboxService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list messages via GET', () => {
    const mockMessages = [
      { id: '1', fullName: 'John', email: 'john@test.com', subject: 'Test', message: 'Hello', category: null, read: false, createdAt: '2024-01-01' }
    ];

    service.listMessages().subscribe((msgs) => {
      expect(msgs).toEqual(mockMessages);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/contact-messages`);
    expect(req.request.method).toBe('GET');
    req.flush(mockMessages);
  });

  it('should get message by id via GET', () => {
    const mockMessage = { id: '1', fullName: 'John', email: 'john@test.com', subject: 'Test', message: 'Hello', category: null, read: false, createdAt: '2024-01-01' };

    service.getMessage('1').subscribe((msg) => {
      expect(msg).toEqual(mockMessage);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/contact-messages/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockMessage);
  });

  it('should mark message as read via PATCH', () => {
    service.markAsRead('1').subscribe((result) => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/contact-messages/1/read`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });

  it('should fetch unread count via GET', () => {
    service.getUnreadCount().subscribe((count) => {
      expect(count).toBe(5);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/contact-messages/unread-count`);
    expect(req.request.method).toBe('GET');
    req.flush(5);
  });
});
