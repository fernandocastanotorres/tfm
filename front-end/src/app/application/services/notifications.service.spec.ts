import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let httpMock: HttpTestingController;

  const mockNotifications = [
    {
      id: 'notif-1',
      subject: 'Formal Notice',
      body: 'Your application is under review',
      availableAt: '2026-05-01T10:00:00Z',
      status: 'AVAILABLE',
      procedureId: 'EXP-2026-001',
      caseTitle: 'License case',
      typeKey: 'FORMAL_NOTICE',
      attachments: []
    },
    {
      id: 'notif-2',
      subject: 'Request Info',
      body: 'Please provide missing documents',
      availableAt: '2026-05-02T10:00:00Z',
      status: 'ACCESSED',
      procedureId: 'EXP-2026-002',
      caseTitle: 'Permit case',
      typeKey: 'REQUEST_INFO',
      attachments: []
    },
    {
      id: 'notif-3',
      subject: 'Resolution',
      body: 'Your application has been approved',
      availableAt: '2026-05-03T10:00:00Z',
      status: 'ACCEPTED',
      procedureId: 'EXP-2026-003',
      caseTitle: 'Certificate case',
      typeKey: 'RESOLUTION_NOTICE',
      attachments: []
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(NotificationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => { expect(service).toBeTruthy(); });

  describe('getInbox', () => {
    it('should return notifications', async () => {
      const inboxPromise = firstValueFrom(service.getInbox());
      
      const req = httpMock.expectOne(req => req.url.includes('/citizen/notifications/formal'));
      req.flush(mockNotifications);
      
      const inbox = await inboxPromise;
      expect(inbox.length).toBe(3);
    });

    it('should return unread notifications', async () => {
      const inboxPromise = firstValueFrom(service.getInbox());
      
      const req = httpMock.expectOne(req => req.url.includes('/citizen/notifications/formal'));
      req.flush(mockNotifications);
      
      const inbox = await inboxPromise;
      const unread = inbox.filter(n => !n.read);
      expect(unread.length).toBe(1);
    });
  });
});;
