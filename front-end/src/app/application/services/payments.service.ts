import { Injectable } from '@angular/core';

export interface PaymentItem {
  id: string;
  concept: string;
  amount: string;
  dueDate: string;
  status: 'Pendiente' | 'Pagado';
}

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  getPayments(): PaymentItem[] {
    return [
      {
        id: 'PAY-1',
        concept: 'Tasa de licencia',
        amount: '120,00 €',
        dueDate: '25/05/2026',
        status: 'Pendiente'
      },
      {
        id: 'PAY-2',
        concept: 'Certificado de empadronamiento',
        amount: '8,00 €',
        dueDate: '12/05/2026',
        status: 'Pagado'
      }
    ];
  }
}
