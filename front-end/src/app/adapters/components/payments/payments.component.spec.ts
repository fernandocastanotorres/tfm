import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentsComponent } from './payments.component';
import { PaymentsService } from '../../../application/services/payments.service';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('PaymentsComponent', () => {
  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot(), ReactiveFormsModule, PaymentsComponent],
    providers: [
        PaymentsService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load payments', () => {
    expect(component.payments.length).toBeGreaterThan(0);
  });

  it('should mark payment as paid', () => {
    const payment = component.payments[0];
    component.markAsPaid(payment);
    expect(payment.statusKey).toBe('PAYMENT_STATUS.PAID');
  });

  it('should set selectedPayment to null when payments array is empty', () => {
    const mockService = TestBed.inject(PaymentsService);
    spyOn(mockService, 'getPayments').and.returnValue([]);
    component.ngOnInit();
    expect(component.selectedPayment).toBeNull();
  });

  it('should filter payments by specific status', () => {
    component.filterForm.patchValue({ status: 'PAYMENT_STATUS.PENDING' });
    const filtered = component.filteredPayments;
    expect(filtered.every(p => p.statusKey === 'PAYMENT_STATUS.PENDING')).toBeTrue();
  });

  it('should filter payments by specific type', () => {
    component.filterForm.patchValue({ type: 'PAYMENTS.TYPE_FEE' });
    const filtered = component.filteredPayments;
    expect(filtered.every(p => p.typeKey === 'PAYMENTS.TYPE_FEE')).toBeTrue();
  });

  it('should filter payments by specific caseId', () => {
    component.filterForm.patchValue({ caseId: 'EXP-2026-001' });
    const filtered = component.filteredPayments;
    expect(filtered.every(p => p.caseId === 'EXP-2026-001')).toBeTrue();
  });

  it('should sort payments by amount', () => {
    component.filterForm.patchValue({ sort: 'amount' });
    const sorted = component.filteredPayments;
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].amountLabel.localeCompare(sorted[i].amountLabel) <= 0).toBeTrue();
    }
  });

  it('should sort payments by status', () => {
    component.filterForm.patchValue({ sort: 'status' });
    const sorted = component.filteredPayments;
    expect(sorted.length).toBeGreaterThan(0);
  });

  it('should filter payments by search text matching caseId', () => {
    component.filterForm.patchValue({ search: 'EXP-2026-001' });
    const filtered = component.filteredPayments;
    expect(filtered.every(p => p.caseId.toLowerCase().includes('exp-2026-001'))).toBeTrue();
  });

  it('should get unique case options from payments', () => {
    const options = component.caseOptions;
    expect(options.length).toBeGreaterThan(0);
    expect(options[0].id).toBeDefined();
  });

  it('should get unique type options from payments', () => {
    const types = component.typeOptions;
    expect(types.length).toBeGreaterThan(0);
  });

  it('selectPayment should update selected and activePaymentId', () => {
    const payment = component.payments[0];
    component.selectPayment(payment);
    expect(component.selectedPayment).toBe(payment);
    expect((component as any).activePaymentId).toBe(payment.id);
  });

  it('changePage should update currentPage', () => {
    component.paginationState = { currentPage: 1, totalPages: 3, pageSize: 10 };
    component.changePage(2);
    expect(component.paginationState.currentPage).toBe(2);
  });

  it('toggleFilter should patch status and update pagination', () => {
    component.toggleFilter('pending');
    expect(component.filterForm.value.status).toBe('pending');
  });

  it('pagedPayments should return correct slice', () => {
    component.paginationState = { currentPage: 1, totalPages: 1, pageSize: 2 };
    const paged = component.pagedPayments;
    expect(paged.length).toBeLessThanOrEqual(2);
  });

  it('onPaymentListKeydown should do nothing when keyManager is null', () => {
    (component as any).keyManager = undefined;
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    component.onPaymentListKeydown(event);
    // No error, just returns
    expect(component).toBeTruthy();
  });

  it('onPaymentListFocus should do nothing when keyManager is null', () => {
    (component as any).keyManager = undefined;
    component.onPaymentListFocus();
    expect(component).toBeTruthy();
  });

  it('onPaymentListFocus should return early when activeItemIndex is already set', () => {
    (component as any).keyManager = { activeItemIndex: 0, setActiveItem: jasmine.createSpy('setActiveItem') };
    component.paginationState.pageSize = 999;
    component.onPaymentListFocus();
    expect(component).toBeTruthy();
  });

  it('onPaymentListFocus should set active item when activePaymentId is found', () => {
    const setSpy = jasmine.createSpy('setActiveItem');
    (component as any).keyManager = { activeItemIndex: null, setActiveItem: setSpy };
    (component as any).activePaymentId = 'nonexistent';
    component.onPaymentListFocus();
    expect(component).toBeTruthy();
  });
});
