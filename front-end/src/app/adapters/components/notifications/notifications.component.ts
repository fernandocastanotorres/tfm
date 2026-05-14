import { Component, OnInit } from '@angular/core';
import { NotificationsService, NotificationInboxItem } from '../../../application/services/notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: []
})
export class NotificationsComponent implements OnInit {
  inbox: NotificationInboxItem[] = [];
  filter: 'all' | 'unread' = 'all';

  constructor(private readonly notificationsService: NotificationsService) {}

  ngOnInit(): void {
    this.inbox = this.notificationsService.getInbox();
  }

  get filteredInbox(): NotificationInboxItem[] {
    if (this.filter === 'unread') {
      return this.inbox.filter((item) => !item.read);
    }
    return this.inbox;
  }

  markAsRead(item: NotificationInboxItem): void {
    item.read = true;
  }

  toggleFilter(filter: 'all' | 'unread'): void {
    this.filter = filter;
  }
}
