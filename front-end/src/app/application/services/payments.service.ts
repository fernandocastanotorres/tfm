import { Injectable } from '@angular/core';

export interface PaymentItem {
  id: string;
  conceptKey: string;
  amountLabel: string;
  dueDate: string;
  statusKey: 'PAYMENT_STATUS.PENDING' | 'PAYMENT_STATUS.PAID';
  typeKey: string;
  caseId: string;
  caseTitleKey: string;
  unitKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  getPayments(): PaymentItem[] {
    return [
      {
        id: 'PAY-1',
        conceptKey: 'PAYMENTS.MOCK_LICENSE_FEE',
        amountLabel: '120,00 €',
        dueDate: '25/05/2026',
        statusKey: 'PAYMENT_STATUS.PENDING',
        typeKey: 'PAYMENTS.TYPE_FEE',
        caseId: 'EXP-2026-001',
        caseTitleKey: 'CASE_DETAIL.MOCK_LICENSE_TITLE',
        unitKey: 'PROCEDURES.UNIT_URBANISM'
      },
      {
        id: 'PAY-2',
        conceptKey: 'PAYMENTS.MOCK_REGISTRY_CERTIFICATE',
        amountLabel: '8,00 €',
        dueDate: '12/05/2026',
        statusKey: 'PAYMENT_STATUS.PAID',
        typeKey: 'PAYMENTS.TYPE_CERTIFICATE',
        caseId: 'EXP-2026-002',
        caseTitleKey: 'PROCEDURES.REGISTRY_TITLE',
        unitKey: 'PROCEDURES.UNIT_REGISTRY'
      },
      {
        id: 'PAY-3',
        conceptKey: 'PAYMENTS.MOCK_PROCESSING_FEE',
        amountLabel: '45,00 €',
        dueDate: '18/05/2026',
        statusKey: 'PAYMENT_STATUS.PENDING',
        typeKey: 'PAYMENTS.TYPE_PROCESSING',
        caseId: 'EXP-2026-003',
        caseTitleKey: 'CASE_DETAIL.MOCK_LICENSE_TITLE',
        unitKey: 'PROCEDURES.UNIT_GENERAL'
      }
    ];
  }
}
