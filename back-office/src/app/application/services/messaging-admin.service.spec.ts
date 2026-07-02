import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MessagingAdminService } from './messaging-admin.service';
import { environment } from '../../../environments/environment';

describe('MessagingAdminService', () => {
  let service: MessagingAdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MessagingAdminService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(MessagingAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch thread messages via GET', () => {
    const mockPage = { messages: [], page: 0, size: 10, totalItems: 0, totalPages: 0 };

    service.getThreadMessages('proc-1', 0, 10).subscribe((page) => {
      expect(page).toEqual(mockPage);
    });

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/admin/procedures/proc-1/messages?page=0&size=10`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('should send message via POST with FormData', () => {
    const mockMessage = { id: 'msg-1', threadId: 'th-1', senderRole: 'ADMIN', senderName: 'Admin', senderEmail: 'admin@tfm.es', content: 'Hello', templateKey: null, read: true, readAt: '2024-01-01', attachmentCount: 0, attachments: [], createdAt: '2024-01-01' };

    service.sendMessage('proc-1', 'Hello', undefined, true).subscribe((msg) => {
      expect(msg).toEqual(mockMessage);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/procedures/proc-1/messages`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(mockMessage);
  });

  it('should send message with template key and files', () => {
    const mockMessage = { id: 'msg-2', threadId: 'th-1', senderRole: 'ADMIN', senderName: 'Admin', senderEmail: 'admin@tfm.es', content: 'Template msg', templateKey: 'TPL_001', read: true, readAt: null, attachmentCount: 1, attachments: [], createdAt: '2024-01-01' };
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    service.sendMessage('proc-1', 'Template msg', 'TPL_001', false, [file]).subscribe((msg) => {
      expect(msg).toEqual(mockMessage);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/procedures/proc-1/messages`);
    expect(req.request.method).toBe('POST');
    req.flush(mockMessage);
  });

  it('should download attachment via GET with blob response', () => {
    const mockBlob = new Blob(['file-content'], { type: 'application/pdf' });

    service.downloadAttachment('att-1').subscribe((blob) => {
      expect(blob).toEqual(mockBlob);
    });

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/admin/procedures/messages/attachments/att-1/download`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });

  it('should fetch unread counts via GET', () => {
    const mockCounts = { citizenUnread: 3, adminUnread: 5 };

    service.getUnreadCounts().subscribe((counts) => {
      expect(counts).toEqual(mockCounts);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/messages/unread-count`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCounts);
  });

  it('should fetch unread thread summaries via GET', () => {
    const mockSummaries = [{ id: 'th-1', procedureId: 'p-1', caseTitle: 'Test', lastMessagePreview: '...', lastMessageAt: '2024-01-01', unreadCount: 2, totalMessages: 5 }];

    service.getUnreadThreadSummaries().subscribe((summaries) => {
      expect(summaries).toEqual(mockSummaries);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/messages/unread-threads`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSummaries);
  });
});
