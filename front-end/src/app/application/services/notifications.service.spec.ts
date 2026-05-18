import { TestBed } from '@angular/core/testing';
import { NotificationsService, NotificationInboxItem } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationsService]
    });
    service = TestBed.inject(NotificationsService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getInbox', () => {
    it('should return an array of NotificationInboxItem', () => {
      const inbox = service.getInbox();
      expect(Array.isArray(inbox)).toBeTrue();
      expect(inbox.length).toBeGreaterThan(0);
    });

    it('should return items with required properties', () => {
      const inbox = service.getInbox();
      const item = inbox[0];

      expect(item.id).toBeDefined();
      expect(item.titleKey).toBeDefined();
      expect(item.messageKey).toBeDefined();
      expect(item.date).toBeDefined();
      expect(typeof item.read).toBe('boolean');
      expect(item.caseId).toBeDefined();
      expect(item.caseTitleKey).toBeDefined();
      expect(item.typeKey).toBeDefined();
    });

    it('should return a mix of read and unread notifications', () => {
      const inbox = service.getInbox();
      const unread = inbox.filter(n => !n.read);
      const read = inbox.filter(n => n.read);
      expect(unread.length).toBeGreaterThan(0);
      expect(read.length).toBeGreaterThan(0);
    });

    it('should return items with unique IDs', () => {
      const inbox = service.getInbox();
      const ids = inbox.map(n => n.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should return consistent mock data on each call', () => {
      const inbox1 = service.getInbox();
      const inbox2 = service.getInbox();
      expect(inbox1.length).toBe(inbox2.length);
      expect(inbox1[0].id).toBe(inbox2[0].id);
    });
  });
});
