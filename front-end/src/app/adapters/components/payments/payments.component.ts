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
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentsService, PaymentItem } from '../../../application/services/payments.service';
import { changePage, updatePageSize, getPaginationState, PaginationState } from '../../../application/utils/pagination';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';

import { trackByIndex } from '../../../application/utils/track-by.utils';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Directive({ selector: '[appPaymentCard]' })
export class PaymentCardDirective {
  constructor(private readonly elementRef: ElementRef<HTMLButtonElement>) {}

  focus(): void {
    this.elementRef.nativeElement.focus();
  }
}

@Component({
    selector: 'app-payments',
    templateUrl: './payments.component.html',
    styleUrls: [],
    imports: [FormsModule, ReactiveFormsModule, NgClass, NgFor, PaymentCardDirective, NgIf, TranslatePipe]
})
export class PaymentsComponent implements OnInit, AfterViewInit, OnDestroy {
  payments: PaymentItem[] = [];
  selectedPayment: PaymentItem | null = null;
  readonly paginationOptions = [10, 20, 50];
  paginationState: PaginationState = { currentPage: 1, totalPages: 1, pageSize: 10 };
  private readonly destroy$ = new Subject<void>();
  private keyManager?: FocusKeyManager<PaymentCardDirective>;
  private activePaymentId: string | null = null;

  @ViewChildren(PaymentCardDirective) paymentCards!: QueryList<PaymentCardDirective>;

  readonly filterForm = this.fb.group({
    search: [''],
    status: ['all'],
    type: ['all'],
    caseId: ['all'],
    sort: ['due'],
    pageSize: [10]
  });

  protected readonly trackByIndex = trackByIndex;

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.payments = this.paymentsService.getPayments();
    this.selectedPayment = this.payments[0] ?? null;
    this.activePaymentId = this.selectedPayment?.id ?? null;
    this.updatePaginationState();
  }

  ngAfterViewInit(): void {
    this.paymentCards.changes
      .pipe(startWith(this.paymentCards), takeUntil(this.destroy$))
      .subscribe(() => this.configureKeyManager());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredPayments(): PaymentItem[] {
    const search = (this.filterForm.value.search ?? '').toString().toLowerCase();
    const status = this.filterForm.value.status ?? 'all';
    const type = this.filterForm.value.type ?? 'all';
    const caseId = this.filterForm.value.caseId ?? 'all';
    const sort = this.filterForm.value.sort ?? 'due';

    let items = this.payments.filter((payment) => {
      const matchesSearch =
        payment.conceptKey.toLowerCase().includes(search) ||
        payment.caseId.toLowerCase().includes(search) ||
        payment.caseTitleKey.toLowerCase().includes(search) ||
        payment.unitKey.toLowerCase().includes(search);
      const matchesStatus = status === 'all' || payment.statusKey === status;
      const matchesType = type === 'all' || payment.typeKey === type;
      const matchesCase = caseId === 'all' || payment.caseId === caseId;
      return matchesSearch && matchesStatus && matchesType && matchesCase;
    });

    items = items.sort((a, b) => {
      if (sort === 'amount') {
        return a.amountLabel.localeCompare(b.amountLabel);
      }
      if (sort === 'status') {
        return a.statusKey.localeCompare(b.statusKey);
      }
      return a.dueDate.localeCompare(b.dueDate);
    });

    return items;
  }

  get pagedPayments(): PaymentItem[] {
    const start = (this.paginationState.currentPage - 1) * this.paginationState.pageSize;
    return this.filteredPayments.slice(start, start + this.paginationState.pageSize);
  }

  get caseOptions(): { id: string; labelKey: string }[] {
    const uniqueCases = new Map<string, string>();
    this.payments.forEach((payment) => {
      if (!uniqueCases.has(payment.caseId)) {
        uniqueCases.set(payment.caseId, payment.caseTitleKey);
      }
    });
    return Array.from(uniqueCases.entries()).map(([id, labelKey]) => ({ id, labelKey }));
  }

  get typeOptions(): string[] {
    return Array.from(new Set(this.payments.map((payment) => payment.typeKey)));
  }

  selectPayment(payment: PaymentItem): void {
    this.selectedPayment = payment;
    this.activePaymentId = payment.id;
  }

  markAsPaid(payment: PaymentItem): void {
    payment.statusKey = 'PAYMENT_STATUS.PAID';
  }

  toggleFilter(filter: 'all' | 'pending' | 'paid'): void {
    this.filterForm.patchValue({ status: filter });
    this.paginationState = updatePageSize(this.filterForm, this.paginationState.pageSize, this.paginationState);
    this.updatePaginationState();
  }

  changePage(page: number): void {
    this.paginationState = changePage(page, this.paginationState);
  }

  updatePageSize(size: number): void {
    this.paginationState = updatePageSize(this.filterForm, size, this.paginationState);
    this.updatePaginationState();
  }

  onPaymentListKeydown(event: KeyboardEvent): void {
    if (!this.keyManager) {
      return;
    }

    this.keyManager.onKeydown(event);
    const activeIndex = this.keyManager.activeItemIndex;
    if (activeIndex === null || activeIndex === undefined) {
      return;
    }

    const payment = this.pagedPayments[activeIndex];
    if (payment) {
      this.activePaymentId = payment.id;
    }
  }

  onPaymentListFocus(): void {
    if (!this.keyManager || this.pagedPayments.length === 0 || this.keyManager.activeItemIndex !== null) {
      return;
    }

    const preferredIndex = this.activePaymentId === null
      ? 0
      : this.pagedPayments.findIndex(payment => payment.id === this.activePaymentId);
    this.keyManager.setActiveItem(preferredIndex >= 0 ? preferredIndex : 0);
  }

  private updatePaginationState(): void {
    this.paginationState = getPaginationState(this.filteredPayments.length, this.filterForm);
  }

  private configureKeyManager(): void {
    this.keyManager = new FocusKeyManager(this.paymentCards).withWrap().withHomeAndEnd();
    if (this.pagedPayments.length === 0) {
      return;
    }

    const preferredIndex = this.activePaymentId === null
      ? 0
      : this.pagedPayments.findIndex(payment => payment.id === this.activePaymentId);
    this.keyManager.setActiveItem(preferredIndex >= 0 ? preferredIndex : 0);
  }
}
