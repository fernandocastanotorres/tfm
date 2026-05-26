import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { MessagesService } from './messages.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let messagesServiceSpy: jasmine.SpyObj<MessagesService>;

  const mockThreads = [
    {
      id: 'thread-1',
      procedureId: 'EXP-2026-001',
      recordNumber: 'REC-001',
      caseTitle: 'License case',
      lastMessagePreview: 'First unread message',
      lastMessageAt: '2026-05-01T10:00:00Z',
      unreadCount: 1,
      totalMessages: 2
    },
    {
      id: 'thread-2',
      procedureId: 'EXP-2026-002',
      recordNumber: 'REC-002',
      caseTitle: 'Permit case',
      lastMessagePreview: 'Second unread message',
      lastMessageAt: '2026-05-02T10:00:00Z',
      unreadCount: 1,
      totalMessages: 4
    },
    {
      id: 'thread-3',
      procedureId: 'EXP-2026-003',
      recordNumber: 'REC-003',
      caseTitle: 'Certificate case',
      lastMessagePreview: 'Read message',
      lastMessageAt: '2026-05-03T10:00:00Z',
      unreadCount: 0,
      totalMessages: 1
    }
  ];

  beforeEach(() => {
    messagesServiceSpy = jasmine.createSpyObj('MessagesService', ['getThreads']);
    messagesServiceSpy.getThreads.and.returnValue(of(mockThreads as any));

    TestBed.configureTestingModule({
      providers: [
        NotificationsService,
        { provide: MessagesService, useValue: messagesServiceSpy }
      ]
    });
    service = TestBed.inject(NotificationsService);
  });

  it('should be created', () => { expect(service).toBeTruthy(); });

  describe('getInbox', () => {
    it('should return notifications', async () => {
      const inbox = await firstValueFrom(service.getInbox());
      expect(inbox.length).toBe(3);
    });

    it('should return unread notifications', async () => {
      const inbox = await firstValueFrom(service.getInbox());
      const unread = inbox.filter(n => !n.read);
      expect(unread.length).toBe(2);
    });

    it('should return notifications with case references', async () => {
      const inbox = await firstValueFrom(service.getInbox());
      expect(inbox[0].caseId).toBe('EXP-2026-001');
    });
  });
});
