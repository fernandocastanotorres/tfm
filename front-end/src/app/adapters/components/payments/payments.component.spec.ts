import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentsComponent } from './payments.component';
import { PaymentsService } from '../../../application/services/payments.service';
import { TranslateModule } from '@ngx-translate/core';

describe('PaymentsComponent', () => {
  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentsComponent],
      imports: [TranslateModule.forRoot()],
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
    expect(payment.status).toBe('Pagado');
  });
});
