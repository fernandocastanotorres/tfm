import { TestBed } from '@angular/core/testing';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PaymentsService] });
    service = TestBed.inject(PaymentsService);
  });

  it('should be created', () => { expect(service).toBeTruthy(); });

  describe('getPayments', () => {
    it('should return payment items', () => {
      const payments = service.getPayments();
      expect(payments.length).toBe(3);
    });

    it('should return pending and paid payments', () => {
      const payments = service.getPayments();
      const pending = payments.filter(p => p.statusKey === 'PAYMENT_STATUS.PENDING');
      const paid = payments.filter(p => p.statusKey === 'PAYMENT_STATUS.PAID');
      expect(pending.length).toBe(2);
      expect(paid.length).toBe(1);
    });

    it('should return payments with amounts', () => {
      const payments = service.getPayments();
      expect(payments[0].amountLabel).toBe('120,00 €');
    });
  });
});
