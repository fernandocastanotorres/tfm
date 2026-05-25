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
import { FormBuilder } from '@angular/forms';
import { NotificationsService } from '../../../application/services/notifications.service';
import { NotificationInboxItem } from '../../../application/models/notification.models';
import { changePage, updatePageSize, getPaginationState, PaginationState } from '../../../application/utils/pagination';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { ToastService } from '../../../application/services/toast.service';

import { trackByIndex } from '../../../application/utils/track-by.utils';

@Directive({
  selector: '[appNotificationCard]',
  standalone: false
})
export class NotificationCardDirective {
  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  focus(): void {
    this.elementRef.nativeElement.focus();
  }
}

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: [],
    standalone: false
})
export class NotificationsComponent implements OnInit, AfterViewInit, OnDestroy {
  inbox: NotificationInboxItem[] = [];
  filter: 'all' | 'unread' = 'all';
  readonly paginationOptions = [10, 20, 50];
  paginationState: PaginationState = { currentPage: 1, totalPages: 1, pageSize: 10 };
  selectedItem: NotificationInboxItem | null = null;
  private readonly destroy$ = new Subject<void>();
  private keyManager?: FocusKeyManager<NotificationCardDirective>;
  private activeItemId: string | null = null;

  @ViewChildren(NotificationCardDirective) notificationCards!: QueryList<NotificationCardDirective>;

  readonly filterForm = this.fb.group({
    search: [''],
    status: ['all'],
    type: ['all'],
    caseId: ['all'],
    sort: ['date'],
    pageSize: [10]
  });

  protected readonly trackByIndex = trackByIndex;

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly fb: FormBuilder,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.notificationsService.getInbox().subscribe({
      next: (items) => {
        this.inbox = items;
        this.selectedItem = this.inbox[0] ?? null;
        this.activeItemId = this.selectedItem?.id ?? null;
        this.updatePaginationState();
      },
      error: () => {
        this.inbox = [];
        this.selectedItem = null;
        this.activeItemId = null;
        this.updatePaginationState();
        this.toast.error('Error al cargar', 'No se pudieron cargar las notificaciones.');
      }
    });
  }

  ngAfterViewInit(): void {
    this.notificationCards.changes
      .pipe(startWith(this.notificationCards), takeUntil(this.destroy$))
      .subscribe(() => this.configureKeyManager());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredInbox(): NotificationInboxItem[] {
    const search = (this.filterForm.value.search ?? '').toString().toLowerCase();
    const status = this.filterForm.value.status ?? 'all';
    const type = this.filterForm.value.type ?? 'all';
    const caseId = this.filterForm.value.caseId ?? 'all';
    const sort = this.filterForm.value.sort ?? 'date';

    let items = this.inbox.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search) ||
        item.message.toLowerCase().includes(search) ||
        item.caseId.toLowerCase().includes(search) ||
        (item.recordNumber ?? '').toLowerCase().includes(search) ||
        item.caseTitle.toLowerCase().includes(search) ||
        item.typeKey.toLowerCase().includes(search);
      const matchesStatus = status === 'all' || (status === 'unread' ? !item.read : item.read);
      const matchesType = type === 'all' || item.typeKey === type;
      const matchesCase = caseId === 'all' || item.caseId === caseId;
      return matchesSearch && matchesStatus && matchesType && matchesCase;
    });

    items = items.sort((a, b) => {
      if (sort === 'title') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return items;
  }

  get pagedInbox(): NotificationInboxItem[] {
    const start = (this.paginationState.currentPage - 1) * this.paginationState.pageSize;
    return this.filteredInbox.slice(start, start + this.paginationState.pageSize);
  }

  get caseOptions(): { id: string; label: string; recordNumber?: string | null }[] {
    const uniqueCases = new Map<string, { label: string; recordNumber?: string | null }>();
    this.inbox.forEach((item) => {
      if (!uniqueCases.has(item.caseId)) {
        uniqueCases.set(item.caseId, { label: item.caseTitle, recordNumber: item.recordNumber ?? null });
      }
    });
    return Array.from(uniqueCases.entries()).map(([id, data]) => ({
      id,
      label: data.label,
      recordNumber: data.recordNumber ?? null
    }));
  }

  get typeOptions(): string[] {
    return Array.from(new Set(this.inbox.map((item) => item.typeKey)));
  }

  markAsRead(item: NotificationInboxItem): void {
    item.read = true;
  }

  toggleFilter(filter: 'all' | 'unread'): void {
    this.filter = filter;
    this.filterForm.patchValue({ status: filter });
    this.paginationState = updatePageSize(this.filterForm, this.paginationState.pageSize, this.paginationState);
    this.updatePaginationState();
  }

  selectItem(item: NotificationInboxItem): void {
    this.selectedItem = item;
    this.activeItemId = item.id;
  }

  changePage(page: number): void {
    this.paginationState = changePage(page, this.paginationState);
  }

  updatePageSize(size: number): void {
    this.paginationState = updatePageSize(this.filterForm, size, this.paginationState);
    this.updatePaginationState();
  }

  onNotificationListKeydown(event: KeyboardEvent): void {
    if (!this.keyManager) {
      return;
    }

    this.keyManager.onKeydown(event);
    const activeIndex = this.keyManager.activeItemIndex;
    if (activeIndex === null || activeIndex === undefined) {
      return;
    }

    const item = this.pagedInbox[activeIndex];
    if (item) {
      this.activeItemId = item.id;
    }
  }

  onNotificationListFocus(): void {
    if (!this.keyManager || this.pagedInbox.length === 0 || this.keyManager.activeItemIndex !== null) {
      return;
    }

    const preferredIndex = this.activeItemId === null
      ? 0
      : this.pagedInbox.findIndex(item => item.id === this.activeItemId);
    this.keyManager.setActiveItem(preferredIndex >= 0 ? preferredIndex : 0);
  }

  private updatePaginationState(): void {
    this.paginationState = getPaginationState(this.filteredInbox.length, this.filterForm);
  }

  private configureKeyManager(): void {
    this.keyManager = new FocusKeyManager(this.notificationCards).withWrap().withHomeAndEnd();
    if (this.pagedInbox.length === 0) {
      return;
    }

    const preferredIndex = this.activeItemId === null
      ? 0
      : this.pagedInbox.findIndex(item => item.id === this.activeItemId);
    this.keyManager.setActiveItem(preferredIndex >= 0 ? preferredIndex : 0);
  }
}
