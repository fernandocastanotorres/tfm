import { Component, OnInit } from '@angular/core';
import { PaymentsService, PaymentItem } from '../../../application/services/payments.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: []
})
export class PaymentsComponent implements OnInit {
  payments: PaymentItem[] = [];
  selectedPayment: PaymentItem | null = null;

  constructor(private readonly paymentsService: PaymentsService) {}

  ngOnInit(): void {
    this.payments = this.paymentsService.getPayments();
    this.selectedPayment = this.payments[0] ?? null;
  }

  selectPayment(payment: PaymentItem): void {
    this.selectedPayment = payment;
  }

  markAsPaid(payment: PaymentItem): void {
    payment.status = 'Pagado';
  }
}
