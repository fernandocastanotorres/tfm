import {
  AfterViewInit,
  Component,
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { ContactInboxService, ContactMessageDto } from '../../../application/services/contact-inbox.service';
import { ToastService } from '../../../application/services/toast.service';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[appInboxItem]',
  standalone: false
})
export class InboxItemDirective {
  constructor(private readonly elementRef: ElementRef<HTMLButtonElement>) {}

  focus(): void {
    this.elementRef.nativeElement.focus();
  }
}

@Component({
    selector: 'app-contact-inbox',
    templateUrl: './contact-inbox.component.html',
    styleUrls: ['./contact-inbox.component.css'],
    standalone: false
})
export class ContactInboxComponent implements OnInit, AfterViewInit, OnDestroy {
  messages: ContactMessageDto[] = [];
  selectedMessage: ContactMessageDto | null = null;
  isLoading = true;
  filterStatus: 'all' | 'unread' | 'read' = 'all';
  private readonly destroy$ = new Subject<void>();
  private keyManager?: FocusKeyManager<InboxItemDirective>;
  private activeMessageId: string | null = null;

  @ViewChildren(InboxItemDirective) inboxItems!: QueryList<InboxItemDirective>;

  constructor(
    private readonly contactInboxService: ContactInboxService,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  ngAfterViewInit(): void {
    this.inboxItems.changes
      .pipe(startWith(this.inboxItems), takeUntil(this.destroy$))
      .subscribe(() => this.configureKeyManager());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.activeMessageId = message.id;
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
    this.activeMessageId = null;
  }

  backToList(): void {
    this.selectedMessage = null;
  }

  onInboxListKeydown(event: KeyboardEvent): void {
    if (!this.keyManager) {
      return;
    }

    this.keyManager.onKeydown(event);
    const activeIndex = this.keyManager.activeItemIndex;
    if (activeIndex === null || activeIndex === undefined) {
      return;
    }
    const message = this.filteredMessages[activeIndex];
    if (message) {
      this.activeMessageId = message.id;
    }
  }

  onInboxListFocus(): void {
    if (!this.keyManager || this.filteredMessages.length === 0) {
      return;
    }

    if (this.keyManager.activeItemIndex !== null) {
      return;
    }

    const preferredIndex = this.activeMessageId === null
      ? 0
      : this.filteredMessages.findIndex(message => message.id === this.activeMessageId);
    this.keyManager.setActiveItem(preferredIndex >= 0 ? preferredIndex : 0);
  }

  private configureKeyManager(): void {
    this.keyManager = new FocusKeyManager(this.inboxItems).withWrap().withHomeAndEnd();
    if (this.filteredMessages.length === 0) {
      return;
    }

    const preferredIndex = this.activeMessageId === null
      ? 0
      : this.filteredMessages.findIndex(message => message.id === this.activeMessageId);
    this.keyManager.setActiveItem(preferredIndex >= 0 ? preferredIndex : 0);
  }
}
