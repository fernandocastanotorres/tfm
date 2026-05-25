import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MessagesService } from './messages.service';
import { NotificationInboxItem } from '../models/notification.models';
import { mapThreadToInboxNotification } from '../utils/thread-notification.mapper';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly messagesService = inject(MessagesService);

  getInbox(): Observable<NotificationInboxItem[]> {
    return this.messagesService.getThreads().pipe(
      map((threads) => threads.map(mapThreadToInboxNotification))
    );
  }
}
