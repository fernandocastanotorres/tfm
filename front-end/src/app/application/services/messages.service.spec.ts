import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MessagesService } from './messages.service';
import { MessageThreadSummary, MessageDto, PagedMessages } from '../models/message.models';

describe('MessagesService', () => {
  let service: MessagesService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8080/api/v1/citizen';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MessagesService]
    });
    service = TestBed.inject(MessagesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getThreads', () => {
    it('should return thread summaries', () => {
      const mockThreads: MessageThreadSummary[] = [
        { id: 't1', procedureId: 'p1', caseTitle: 'Case 1', lastMessagePreview: 'Hello', lastMessageAt: '2026-05-20T10:00:00Z', unreadCount: 2, totalMessages: 5 }
      ];

      service.getThreads().subscribe(threads => {
        expect(threads.length).toBe(1);
        expect(threads[0].caseTitle).toBe('Case 1');
      });

      const req = httpMock.expectOne(`${baseUrl}/messages/threads`);
      expect(req.request.method).toBe('GET');
      req.flush(mockThreads);
    });
  });

  describe('getThreadMessages', () => {
    it('should return paginated messages with default params', () => {
      const mockResponse: PagedMessages = {
        messages: [],
        page: 0,
        size: 20,
        totalItems: 0,
        totalPages: 0
      };

      service.getThreadMessages('proc-1', 0, 20).subscribe(result => {
        expect(result.page).toBe(0);
        expect(result.size).toBe(20);
      });

      const req = httpMock.expectOne(req =>
        req.url === `${baseUrl}/procedures/proc-1/messages` &&
        req.params.get('page') === '0' &&
        req.params.get('size') === '20'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should send correct pagination params', () => {
      const mockResponse: PagedMessages = {
        messages: [],
        page: 2,
        size: 10,
        totalItems: 25,
        totalPages: 3
      };

      service.getThreadMessages('proc-1', 2, 10).subscribe(result => {
        expect(result.totalItems).toBe(25);
        expect(result.totalPages).toBe(3);
      });

      const req = httpMock.expectOne(req =>
        req.params.get('page') === '2' &&
        req.params.get('size') === '10'
      );
      req.flush(mockResponse);
    });
  });

  describe('sendMessage', () => {
    it('should send message with FormData', () => {
      const mockResponse: MessageDto = {
        id: 'msg-1',
        threadId: 't1',
        senderRole: 'CITIZEN',
        senderName: 'Test User',
        senderEmail: 'test@tfm.es',
        content: 'Hello',
        templateKey: null,
        read: false,
        readAt: null,
        attachmentCount: 0,
        attachments: [],
        createdAt: '2026-05-20T10:00:00Z'
      };

      service.sendMessage('proc-1', 'Hello').subscribe(result => {
        expect(result.content).toBe('Hello');
        expect(result.senderRole).toBe('CITIZEN');
      });

      const req = httpMock.expectOne(`${baseUrl}/procedures/proc-1/messages`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTrue();
      req.flush(mockResponse);
    });

    it('should include templateKey when provided', () => {
      service.sendMessage('proc-1', 'Hello', 'welcome-template').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/procedures/proc-1/messages`);
      const body = req.request.body as FormData;
      expect(body.get('templateKey')).toBe('welcome-template');
      req.flush({});
    });

    it('should set notifyByEmail to false when specified', () => {
      service.sendMessage('proc-1', 'Hello', undefined, false).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/procedures/proc-1/messages`);
      const body = req.request.body as FormData;
      expect(body.get('notifyByEmail')).toBe('false');
      req.flush({});
    });

    it('should append files when provided', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      service.sendMessage('proc-1', 'Hello', undefined, true, [file]).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/procedures/proc-1/messages`);
      const body = req.request.body as FormData;
      expect(body.get('files')).toBeTruthy();
      req.flush({});
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', () => {
      service.getUnreadCount().subscribe(count => {
        expect(count).toBe(3);
      });

      const req = httpMock.expectOne(`${baseUrl}/messages/unread-count`);
      expect(req.request.method).toBe('GET');
      req.flush(3);
    });
  });
});
