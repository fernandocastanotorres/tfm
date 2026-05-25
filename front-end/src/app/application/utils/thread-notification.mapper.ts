import { MessageThreadSummary } from '../models/message.models';
import { DashboardNotificationItem, NotificationInboxItem } from '../models/notification.models';

const EMPTY_PREVIEW = 'Sin mensajes recientes.';

export function mapThreadToInboxNotification(thread: MessageThreadSummary): NotificationInboxItem {
  return {
    id: thread.id,
    title: thread.unreadCount > 0 ? 'Nuevo mensaje en tu expediente' : 'Actualizacion del expediente',
    message: thread.lastMessagePreview || EMPTY_PREVIEW,
    date: thread.lastMessageAt,
    read: thread.unreadCount === 0,
    caseId: thread.procedureId,
    recordNumber: thread.recordNumber ?? null,
    caseTitle: thread.caseTitle,
    typeKey: 'NOTIFICATIONS.TYPE_STATUS'
  };
}

export function mapThreadsToDashboardNotifications(
  threads: MessageThreadSummary[],
  limit: number = 5
): DashboardNotificationItem[] {
  return threads
    .slice()
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    .slice(0, limit)
    .map((thread) => ({
      id: thread.id,
      message: thread.lastMessagePreview || EMPTY_PREVIEW,
      date: thread.lastMessageAt,
      caseId: thread.procedureId,
      caseTitle: thread.caseTitle,
      recordNumber: thread.recordNumber ?? null
    }));
}
