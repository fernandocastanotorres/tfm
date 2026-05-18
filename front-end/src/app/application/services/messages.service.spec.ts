import { TestBed } from '@angular/core/testing';
import { MessagesService, MessageThread, MessageItem } from './messages.service';

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessagesService]
    });
    service = TestBed.inject(MessagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getThreads', () => {
    it('should return an array of MessageThread', () => {
      const threads = service.getThreads();
      expect(Array.isArray(threads)).toBeTrue();
      expect(threads.length).toBeGreaterThan(0);
    });

    it('should return threads with required properties', () => {
      const threads = service.getThreads();
      const thread = threads[0];

      expect(thread.id).toBeDefined();
      expect(thread.subjectKey).toBeDefined();
      expect(thread.updatedAt).toBeDefined();
      expect(typeof thread.unread).toBe('boolean');
      expect(thread.caseId).toBeDefined();
      expect(thread.caseTitleKey).toBeDefined();
      expect(Array.isArray(thread.messages)).toBeTrue();
    });

    it('should return threads with messages', () => {
      const threads = service.getThreads();

      for (const thread of threads) {
        expect(thread.messages.length).toBeGreaterThan(0);
        for (const message of thread.messages) {
          expect(message.id).toBeDefined();
          expect(message.senderKey).toBeDefined();
          expect(message.sentAt).toBeDefined();
        }
      }
    });

    it('should return at least one unread thread', () => {
      const threads = service.getThreads();
      const unreadThreads = threads.filter(t => t.unread);
      expect(unreadThreads.length).toBeGreaterThan(0);
    });

    it('should return at least one read thread', () => {
      const threads = service.getThreads();
      const readThreads = threads.filter(t => !t.unread);
      expect(readThreads.length).toBeGreaterThan(0);
    });

    it('should return consistent mock data on each call', () => {
      const threads1 = service.getThreads();
      const threads2 = service.getThreads();
      expect(threads1.length).toBe(threads2.length);
      expect(threads1[0].id).toBe(threads2[0].id);
    });
  });
});
