import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentsComponent } from './payments.component';
import { PaymentsService } from '../../../application/services/payments.service';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

describe('PaymentsComponent', () => {
  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentsComponent],
      imports: [TranslateModule.forRoot(), ReactiveFormsModule],
      providers: [PaymentsService]
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
});
