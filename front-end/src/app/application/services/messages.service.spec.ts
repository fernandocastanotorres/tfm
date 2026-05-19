import { TestBed } from '@angular/core/testing';
import { MessagesService } from './messages.service';

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
    it('should return message threads', () => {
      const threads = service.getThreads();
      expect(threads.length).toBeGreaterThan(0);
      expect(threads[0].id).toBe('MSG-1');
    });

    it('should return threads with messages', () => {
      const threads = service.getThreads();
      expect(threads[0].messages.length).toBeGreaterThan(0);
    });

    it('should return threads with unread flag', () => {
      const threads = service.getThreads();
      expect(threads[0].unread).toBeTrue();
    });
  });
});
