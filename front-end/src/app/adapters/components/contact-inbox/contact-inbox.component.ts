import { Component, OnInit } from '@angular/core';
import { ContactInboxService, ContactMessageDto } from '../../../application/services/contact-inbox.service';
import { ToastService } from '../../../application/services/toast.service';

@Component({
    selector: 'app-contact-inbox',
    templateUrl: './contact-inbox.component.html',
    styleUrls: ['./contact-inbox.component.css'],
    standalone: false
})
export class ContactInboxComponent implements OnInit {
  messages: ContactMessageDto[] = [];
  selectedMessage: ContactMessageDto | null = null;
  isLoading = true;
  filterStatus: 'all' | 'unread' | 'read' = 'all';

  constructor(
    private readonly contactInboxService: ContactInboxService,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.isLoading = true;
    this.contactInboxService.listMessages().subscribe({
      next: (messages) => {
        this.messages = messages;
        this.isLoading = false;
      },
      error: () => {
        this.messages = [];
        this.isLoading = false;
        this.toast.error('Error al cargar el buzon de contacto');
      }
    });
  }

  selectMessage(message: ContactMessageDto): void {
    this.selectedMessage = message;
    if (!message.read) {
      this.contactInboxService.markAsRead(message.id).subscribe({
        next: () => {
          this.selectedMessage = { ...message, read: true };
          this.loadMessages();
        },
        error: () => {
          this.toast.error('Error al marcar como leido');
        }
      });
    }
  }

  get filteredMessages(): ContactMessageDto[] {
    if (this.filterStatus === 'all') {
      return this.messages;
    }
    return this.messages.filter(m => this.filterStatus === 'unread' ? !m.read : m.read);
  }

  get unreadCount(): number {
    return this.messages.filter(m => !m.read).length;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  setFilter(filter: 'all' | 'unread' | 'read'): void {
    this.filterStatus = filter;
  }

  backToList(): void {
    this.selectedMessage = null;
  }
}
