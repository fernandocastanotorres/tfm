import { TestBed } from '@angular/core/testing';
import { PaymentsService, PaymentItem } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PaymentsService]
    });
    service = TestBed.inject(PaymentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPayments', () => {
    it('should return an array of PaymentItem', () => {
      const payments = service.getPayments();
      expect(Array.isArray(payments)).toBeTrue();
      expect(payments.length).toBeGreaterThan(0);
    });

    it('should return payments with required properties', () => {
      const payments = service.getPayments();
      const payment = payments[0];

      expect(payment.id).toBeDefined();
      expect(payment.conceptKey).toBeDefined();
      expect(payment.amountLabel).toBeDefined();
      expect(payment.dueDate).toBeDefined();
      expect(payment.statusKey).toBeDefined();
      expect(payment.typeKey).toBeDefined();
      expect(payment.caseId).toBeDefined();
      expect(payment.caseTitleKey).toBeDefined();
      expect(payment.unitKey).toBeDefined();
    });

    it('should return payments with valid status values', () => {
      const payments = service.getPayments();
      const validStatuses = ['PAYMENT_STATUS.PENDING', 'PAYMENT_STATUS.PAID'];

      for (const payment of payments) {
        expect(validStatuses).toContain(payment.statusKey);
      }
    });

    it('should return a mix of pending and paid payments', () => {
      const payments = service.getPayments();
      const pending = payments.filter(p => p.statusKey === 'PAYMENT_STATUS.PENDING');
      const paid = payments.filter(p => p.statusKey === 'PAYMENT_STATUS.PAID');
      expect(pending.length).toBeGreaterThan(0);
      expect(paid.length).toBeGreaterThan(0);
    });

    it('should return payments with unique IDs', () => {
      const payments = service.getPayments();
      const ids = payments.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should return consistent mock data on each call', () => {
      const payments1 = service.getPayments();
      const payments2 = service.getPayments();
      expect(payments1.length).toBe(payments2.length);
      expect(payments1[0].id).toBe(payments2[0].id);
    });
  });
});
