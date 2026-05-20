import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PaymentsService, PaymentItem } from '../../../application/services/payments.service';
import { changePage, updatePageSize, getPaginationState, PaginationState } from '../../../application/utils/pagination';

@Component({
    selector: 'app-payments',
    templateUrl: './payments.component.html',
    styleUrls: [],
    standalone: false
})
export class PaymentsComponent implements OnInit {
  payments: PaymentItem[] = [];
  selectedPayment: PaymentItem | null = null;
  readonly paginationOptions = [10, 20, 50];
  paginationState: PaginationState = { currentPage: 1, totalPages: 1, pageSize: 10 };

  readonly filterForm = this.fb.group({
    search: [''],
    status: ['all'],
    type: ['all'],
    caseId: ['all'],
    sort: ['due'],
    pageSize: [10]
  });

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.payments = this.paymentsService.getPayments();
    this.selectedPayment = this.payments[0] ?? null;
    this.updatePaginationState();
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

  private updatePaginationState(): void {
    this.paginationState = getPaginationState(this.filteredPayments.length, this.filterForm);
  }
}
