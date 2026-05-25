import { MessageThreadSummary } from '../models/message.models';
import { mapThreadToInboxNotification, mapThreadsToDashboardNotifications } from './thread-notification.mapper';

describe('thread-notification mapper', () => {
  const makeThread = (overrides: Partial<MessageThreadSummary> = {}): MessageThreadSummary => ({
    id: 'thread-1',
    procedureId: '9f2f58f0-8de6-4ab5-bca3-fb37f93da8c1',
    recordNumber: 'EXP/URBANISMO/2026/000001',
    caseTitle: 'Licencia de obra menor',
    lastMessagePreview: 'Tu expediente ha pasado a revision final.',
    lastMessageAt: '2026-05-25T10:00:00Z',
    unreadCount: 1,
    totalMessages: 4,
    ...overrides
  });

  describe('mapThreadToInboxNotification', () => {
    it('maps unread thread to unread inbox notification', () => {
      const thread = makeThread();

      const notification = mapThreadToInboxNotification(thread);

      expect(notification.id).toBe(thread.id);
      expect(notification.title).toBe('Nuevo mensaje en tu expediente');
      expect(notification.message).toBe(thread.lastMessagePreview);
      expect(notification.read).toBeFalse();
      expect(notification.caseId).toBe(thread.procedureId);
      expect(notification.recordNumber).toBe(thread.recordNumber);
      expect(notification.caseTitle).toBe(thread.caseTitle);
      expect(notification.typeKey).toBe('NOTIFICATIONS.TYPE_STATUS');
    });

    it('maps read thread with fallback preview and record number null', () => {
      const thread = makeThread({ unreadCount: 0, lastMessagePreview: '', recordNumber: null });

      const notification = mapThreadToInboxNotification(thread);

      expect(notification.title).toBe('Actualizacion del expediente');
      expect(notification.message).toBe('Sin mensajes recientes.');
      expect(notification.read).toBeTrue();
      expect(notification.recordNumber).toBeNull();
    });
  });

  describe('mapThreadsToDashboardNotifications', () => {
    it('sorts by most recent message date desc and applies default limit', () => {
      const threads: MessageThreadSummary[] = [
        makeThread({ id: 'a', lastMessageAt: '2026-05-25T08:00:00Z' }),
        makeThread({ id: 'b', lastMessageAt: '2026-05-25T10:00:00Z' }),
        makeThread({ id: 'c', lastMessageAt: '2026-05-25T09:00:00Z' })
      ];

      const notifications = mapThreadsToDashboardNotifications(threads);

      expect(notifications.map((n) => n.id)).toEqual(['b', 'c', 'a']);
      expect(notifications.length).toBe(3);
    });

    it('enforces custom limit and keeps fallback preview', () => {
      const threads: MessageThreadSummary[] = [
        makeThread({ id: '1', lastMessagePreview: '' }),
        makeThread({ id: '2', lastMessageAt: '2026-05-25T11:00:00Z' })
      ];

      const notifications = mapThreadsToDashboardNotifications(threads, 1);

      expect(notifications.length).toBe(1);
      expect(notifications[0].id).toBe('2');
      expect(mapThreadsToDashboardNotifications([threads[0]], 1)[0].message).toBe('Sin mensajes recientes.');
    });

    it('does not mutate original array order', () => {
      const threads: MessageThreadSummary[] = [
        makeThread({ id: 'x', lastMessageAt: '2026-05-25T08:00:00Z' }),
        makeThread({ id: 'y', lastMessageAt: '2026-05-25T10:00:00Z' })
      ];

      mapThreadsToDashboardNotifications(threads);

      expect(threads.map((t) => t.id)).toEqual(['x', 'y']);
    });
  });
});
