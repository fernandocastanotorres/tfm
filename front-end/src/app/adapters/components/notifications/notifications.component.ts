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
import { NotificationsService, NotificationInboxItem } from '../../../application/services/notifications.service';
import { changePage, updatePageSize, getPaginationState, PaginationState } from '../../../application/utils/pagination';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';

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

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.inbox = this.notificationsService.getInbox();
    this.selectedItem = this.inbox[0] ?? null;
    this.activeItemId = this.selectedItem?.id ?? null;
    this.updatePaginationState();
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
        item.titleKey.toLowerCase().includes(search) ||
        item.messageKey.toLowerCase().includes(search) ||
        item.caseId.toLowerCase().includes(search) ||
        item.caseTitleKey.toLowerCase().includes(search) ||
        item.typeKey.toLowerCase().includes(search);
      const matchesStatus = status === 'all' || (status === 'unread' ? !item.read : item.read);
      const matchesType = type === 'all' || item.typeKey === type;
      const matchesCase = caseId === 'all' || item.caseId === caseId;
      return matchesSearch && matchesStatus && matchesType && matchesCase;
    });

    items = items.sort((a, b) => {
      if (sort === 'title') {
        return a.titleKey.localeCompare(b.titleKey);
      }
      return b.date.localeCompare(a.date);
    });

    return items;
  }

  get pagedInbox(): NotificationInboxItem[] {
    const start = (this.paginationState.currentPage - 1) * this.paginationState.pageSize;
    return this.filteredInbox.slice(start, start + this.paginationState.pageSize);
  }

  get caseOptions(): { id: string; labelKey: string }[] {
    const uniqueCases = new Map<string, string>();
    this.inbox.forEach((item) => {
      if (!uniqueCases.has(item.caseId)) {
        uniqueCases.set(item.caseId, item.caseTitleKey);
      }
    });
    return Array.from(uniqueCases.entries()).map(([id, labelKey]) => ({ id, labelKey }));
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
