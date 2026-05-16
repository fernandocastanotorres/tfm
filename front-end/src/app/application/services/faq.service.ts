import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { FaqCategory, FaqItem } from '../models/sede.models';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private readonly categories: FaqCategory[] = [
    { id: 'general', nameKey: 'FAQ.CAT_GENERAL', icon: 'info' },
    { id: 'procedures', nameKey: 'FAQ.CAT_PROCEDURES', icon: 'document' },
    { id: 'digital-certificate', nameKey: 'FAQ.CAT_CERTIFICATE', icon: 'shield' },
    { id: 'payments', nameKey: 'FAQ.CAT_PAYMENTS', icon: 'payment' },
    { id: 'appointments', nameKey: 'FAQ.CAT_APPOINTMENTS', icon: 'calendar' }
  ];

  private readonly faqs: FaqItem[] = [
    { id: '1', categoryId: 'general', questionKey: 'FAQ.Q_WHAT_IS_SEDE', answerKey: 'FAQ.A_WHAT_IS_SEDE' },
    { id: '2', categoryId: 'general', questionKey: 'FAQ.Q_HOW_TO_ACCESS', answerKey: 'FAQ.A_HOW_TO_ACCESS' },
    { id: '3', categoryId: 'general', questionKey: 'FAQ.Q_DATA_PROTECTION', answerKey: 'FAQ.A_DATA_PROTECTION' },
    { id: '4', categoryId: 'procedures', questionKey: 'FAQ.Q_HOW_TO_START', answerKey: 'FAQ.A_HOW_TO_START' },
    { id: '5', categoryId: 'procedures', questionKey: 'FAQ.Q_TRACK_PROCEDURE', answerKey: 'FAQ.A_TRACK_PROCEDURE' },
    { id: '6', categoryId: 'procedures', questionKey: 'FAQ.Q_REQUIRED_DOCS', answerKey: 'FAQ.A_REQUIRED_DOCS' },
    { id: '7', categoryId: 'digital-certificate', questionKey: 'FAQ.Q_GET_CERTIFICATE', answerKey: 'FAQ.A_GET_CERTIFICATE' },
    { id: '8', categoryId: 'digital-certificate', questionKey: 'FAQ.Q_CERTIFICATE_TYPES', answerKey: 'FAQ.A_CERTIFICATE_TYPES' },
    { id: '9', categoryId: 'payments', questionKey: 'FAQ.Q_PAYMENT_METHODS', answerKey: 'FAQ.A_PAYMENT_METHODS' },
    { id: '10', categoryId: 'payments', questionKey: 'FAQ.Q_PAYMENT_RECEIPT', answerKey: 'FAQ.A_PAYMENT_RECEIPT' },
    { id: '11', categoryId: 'appointments', questionKey: 'FAQ.Q_BOOK_APPOINTMENT', answerKey: 'FAQ.A_BOOK_APPOINTMENT' },
    { id: '12', categoryId: 'appointments', questionKey: 'FAQ.Q_CANCEL_APPOINTMENT', answerKey: 'FAQ.A_CANCEL_APPOINTMENT' }
  ];

  getCategories(): Observable<FaqCategory[]> {
    return of(this.categories).pipe(delay(300));
  }

  getFaqsByCategory(categoryId: string): Observable<FaqItem[]> {
    const filtered = categoryId === 'all'
      ? this.faqs
      : this.faqs.filter(f => f.categoryId === categoryId);
    return of(filtered).pipe(delay(300));
  }

  searchFaqs(query: string): Observable<FaqItem[]> {
    const lower = query.toLowerCase();
    const results = this.faqs.filter(f =>
      f.questionKey.toLowerCase().includes(lower) ||
      f.answerKey.toLowerCase().includes(lower)
    );
    return of(results).pipe(delay(300));
  }
}
