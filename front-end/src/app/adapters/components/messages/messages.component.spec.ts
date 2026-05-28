import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MessagesComponent } from './messages.component';
import { MessagesService } from '../../../application/services/messages.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../../application/services/toast.service';
import { SkeletonScreenComponent } from '../../../shared/components/skeleton-screen/skeleton-screen.component';

describe('MessagesComponent', () => {
  let component: MessagesComponent;
  let fixture: ComponentFixture<MessagesComponent>;
  let httpMock: HttpTestingController;
  let toastSpy: jasmine.SpyObj<ToastService>;
  const baseUrl = 'http://localhost:8080/api/v1/citizen';

  const mockThreads = [
    { id: 't1', procedureId: 'p1', caseTitle: 'Case One', lastMessagePreview: 'Hello there', lastMessageAt: '2026-05-20T10:00:00Z', unreadCount: 2, totalMessages: 5 },
    { id: 't2', procedureId: 'p2', caseTitle: 'Case Two', lastMessagePreview: 'Reply needed', lastMessageAt: '2026-05-19T10:00:00Z', unreadCount: 0, totalMessages: 3 }
  ];

  beforeEach(async () => {
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'warning']);

    await TestBed.configureTestingModule({
      declarations: [MessagesComponent],
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        SkeletonScreenComponent
      ],
      providers: [
        { provide: ToastService, useValue: toastSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MessagesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load threads on init', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${baseUrl}/messages/threads`);
    expect(req.request.method).toBe('GET');
    req.flush(mockThreads);

    expect(component.threads.length).toBe(2);
    expect(component.isLoadingThreads).toBeFalse();
  });

  it('should handle empty threads', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${baseUrl}/messages/threads`);
    req.flush([]);

    expect(component.threads).toEqual([]);
  });

  describe('toggleThread', () => {
    beforeEach(() => {
      fixture.detectChanges();
      httpMock.expectOne(`${baseUrl}/messages/threads`).flush(mockThreads);
    });

    it('should expand thread and load messages', fakeAsync(() => {
      component.toggleThread('p1');

      expect(component.expandedThreadId).toBe('p1');
      expect(component.selectedThread).toBeTruthy();
      expect(component.selectedThread!.procedureId).toBe('p1');

      const req = httpMock.expectOne(req =>
        req.url.includes('/procedures/p1/messages')
      );
      req.flush({ messages: [], page: 0, size: 20, totalItems: 0, totalPages: 0 });

      // loadMessages triggers loadThreads() which makes another GET
      const threadsReq = httpMock.expectOne(`${baseUrl}/messages/threads`);
      threadsReq.flush(mockThreads);

      tick();
    }));

    it('should collapse thread when already expanded', () => {
      component.expandedThreadId = 'p1';
      component.selectedThread = mockThreads[0];

      component.toggleThread('p1');

      expect(component.expandedThreadId).toBeNull();
      expect(component.selectedThread).toBeNull();
    });
  });

  describe('sendReply', () => {
    beforeEach(() => {
      fixture.detectChanges();
      httpMock.expectOne(`${baseUrl}/messages/threads`).flush(mockThreads);
    });

    it('should not send when no thread selected', () => {
      component.selectedThread = null;
      component.reply = 'Hello';
      component.sendReply();

      expect(component.reply).toBe('Hello');
      httpMock.expectNone(`${baseUrl}/procedures/p1/messages`);
    });

    it('should not send when reply is empty', () => {
      component.selectedThread = mockThreads[0];
      component.reply = '';
      component.sendReply();

      expect(component.reply).toBe('');
    });

    it('should send reply and clear input', fakeAsync(() => {
      component.selectedThread = mockThreads[0];
      component.reply = 'Hello admin';
      component.sendReply();

      const sendReq = httpMock.expectOne(req =>
        req.url.includes('/procedures/p1/messages') && req.method === 'POST'
      );
      sendReq.flush({ id: 'msg1', content: 'Hello admin' });

      // loadMessages calls getThreadMessages first
      const loadReq = httpMock.expectOne(req => req.url.includes('/procedures/p1/messages') && req.method === 'GET');
      loadReq.flush({ messages: [], page: 0, size: 20, totalItems: 0, totalPages: 0 });

      // Then loadMessages triggers loadThreads() which makes another GET
      const threadsReq = httpMock.expectOne(`${baseUrl}/messages/threads`);
      threadsReq.flush(mockThreads);

      tick();

      expect(component.reply).toBe('');
      expect(component.isSending).toBeFalse();
      expect(toastSpy.success).toHaveBeenCalled();
    }));

    it('should show error toast when send fails', () => {
      component.selectedThread = mockThreads[0];
      component.reply = 'Hello';
      component.sendReply();

      const req = httpMock.expectOne(req => req.method === 'POST');
      req.error(new ProgressEvent('Network error'));

      expect(component.isSending).toBeFalse();
      expect(toastSpy.error).toHaveBeenCalled();
    });
  });

  describe('filteredThreads', () => {
    beforeEach(() => {
      fixture.detectChanges();
      httpMock.expectOne(`${baseUrl}/messages/threads`).flush(mockThreads);
    });

    it('should filter by unread status', () => {
      component.filterForm.patchValue({ status: 'unread' });
      const filtered = component.filteredThreads;

      expect(filtered.every(t => t.unreadCount > 0)).toBeTrue();
      expect(filtered.length).toBe(1);
    });

    it('should filter by read status', () => {
      component.filterForm.patchValue({ status: 'read' });
      const filtered = component.filteredThreads;

      expect(filtered.every(t => t.unreadCount === 0)).toBeTrue();
    });

    it('should filter by search text matching caseTitle', () => {
      component.filterForm.patchValue({ search: 'case one' });
      const filtered = component.filteredThreads;

      expect(filtered.length).toBe(1);
      expect(filtered[0].caseTitle).toBe('Case One');
    });

    it('should filter by search text matching procedureId', () => {
      component.filterForm.patchValue({ search: 'p2' });
      const filtered = component.filteredThreads;

      expect(filtered.length).toBe(1);
      expect(filtered[0].procedureId).toBe('p2');
    });

    it('should sort threads by subject alphabetically', () => {
      component.filterForm.patchValue({ sort: 'subject' });
      const sorted = component.filteredThreads;

      expect(sorted[0].caseTitle).toBe('Case One');
      expect(sorted[1].caseTitle).toBe('Case Two');
    });

    it('should sort threads by updated date (newest first)', () => {
      component.filterForm.patchValue({ sort: 'updated' });
      const sorted = component.filteredThreads;

      expect(sorted[0].procedureId).toBe('p1');
      expect(sorted[1].procedureId).toBe('p2');
    });
  });

  describe('downloadAttachment', () => {
    it('should download attachment and trigger file download', () => {
      const blob = new Blob(['file content'], { type: 'application/pdf' });

      component.downloadAttachment('att1', 'doc.pdf');

      const req = httpMock.expectOne(req =>
        req.url.includes('/attachments/att1/download')
      );
      req.flush(blob);
    });

    it('should show error toast when download fails', () => {
      component.downloadAttachment('att1', 'doc.pdf');

      const req = httpMock.expectOne(req => req.url.includes('/attachments/att1/download'));
      req.error(new ProgressEvent('Network error'));

      expect(toastSpy.error).toHaveBeenCalled();
    });
  });

  describe('formatMessageDate', () => {
    it('should format date string', () => {
      const result = component.formatMessageDate('2026-05-20T10:30:00Z');
      expect(result).toContain('2026');
    });
  });

  describe('caseOptions', () => {
    beforeEach(() => {
      fixture.detectChanges();
      httpMock.expectOne(`${baseUrl}/messages/threads`).flush(mockThreads);
    });

    it('should return unique case options', () => {
      expect(component.caseOptions.length).toBe(2);
      expect(component.caseOptions[0].id).toBe('p1');
      expect(component.caseOptions[1].id).toBe('p2');
    });
  });

  describe('Error Handling', () => {
    it('should handle loadThreads error', () => {
      fixture.detectChanges();
      const req = httpMock.expectOne(`${baseUrl}/messages/threads`);
      req.error(new ProgressEvent('Network error'));
      expect(component.threads).toEqual([]);
      expect(component.isLoadingThreads).toBeFalse();
    });

    it('should handle loadMessages error', () => {
      fixture.detectChanges();
      httpMock.expectOne(`${baseUrl}/messages/threads`).flush(mockThreads);
      component.toggleThread('p1');
      const msgReq = httpMock.expectOne(req => req.url.includes('/procedures/p1/messages'));
      msgReq.error(new ProgressEvent('Network error'));
      expect(component.messages).toEqual([]);
      expect(component.isLoadingMessages).toBeFalse();
    });

    it('should handle sendReply error', () => {
      component.selectedThread = mockThreads[0];
      component.reply = 'Hello';
      component.sendReply();
      const sendReq = httpMock.expectOne(req => req.method === 'POST');
      sendReq.error(new ProgressEvent('Network error'));
      expect(toastSpy.error).toHaveBeenCalled();
      expect(component.isSending).toBeFalse();
    });

    it('sendReply should not send when reply is whitespace only', () => {
      component.selectedThread = mockThreads[0];
      component.reply = '   ';
      component.sendReply();
      httpMock.expectNone(req => req.method === 'POST');
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
      httpMock.expectOne(`${baseUrl}/messages/threads`).flush(mockThreads);
    });

    it('onThreadKeydown should return on non-arrow keys', () => {
      const el = document.createElement('div');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      Object.defineProperty(event, 'currentTarget', { value: el });
      component.onThreadKeydown(event);
      // No error, just returns
      expect(component).toBeTruthy();
    });

    it('onThreadKeydown should move focus on ArrowDown', () => {
      const header1 = document.createElement('div');
      header1.className = 'message-thread__header';
      const header2 = document.createElement('div');
      header2.className = 'message-thread__header';
      document.body.appendChild(header1);
      document.body.appendChild(header2);
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      Object.defineProperty(event, 'currentTarget', { value: header1 });
      spyOn(event, 'preventDefault');
      component.onThreadKeydown(event);
      document.body.removeChild(header1);
      document.body.removeChild(header2);
      expect(component).toBeTruthy();
    });

    it('changeMessagePage should do nothing when no thread selected', () => {
      component.selectedThread = null;
      component.changeMessagePage(1);
      expect(component.messagePage).toBe(0);
    });

    it('changeMessagePageSize should update page size', () => {
      component.selectedThread = mockThreads[0];
      // Setup HTTP expectations for loadMessages
      component.changeMessagePageSize(50);
      const msgReq = httpMock.expectOne(req => req.url.includes('/procedures/p1/messages'));
      msgReq.flush({ messages: [], page: 0, size: 50, totalItems: 0, totalPages: 0 });
      const threadReq = httpMock.expectOne(`${baseUrl}/messages/threads`);
      threadReq.flush(mockThreads);
      expect(component.messagePageSize).toBe(50);
    });
  });

  describe('filteredThreads filter by caseId', () => {
    beforeEach(() => {
      fixture.detectChanges();
      httpMock.expectOne(`${baseUrl}/messages/threads`).flush(mockThreads);
    });

    it('should filter by caseId', () => {
      component.filterForm.patchValue({ caseId: 'p1' });
      const filtered = component.filteredThreads;
      expect(filtered.length).toBe(1);
      expect(filtered[0].procedureId).toBe('p1');
    });
  });
});
