import { TestBed } from '@angular/core/testing';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [NotificationsService] });
    service = TestBed.inject(NotificationsService);
  });

  it('should be created', () => { expect(service).toBeTruthy(); });

  describe('getInbox', () => {
    it('should return notifications', () => {
      const inbox = service.getInbox();
      expect(inbox.length).toBe(3);
    });

    it('should return unread notifications', () => {
      const inbox = service.getInbox();
      const unread = inbox.filter(n => !n.read);
      expect(unread.length).toBe(2);
    });

    it('should return notifications with case references', () => {
      const inbox = service.getInbox();
      expect(inbox[0].caseId).toBe('EXP-2026-001');
    });
  });
});
