import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { FaqCategory, FaqItem } from '../models/sede.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private readonly baseUrl = `${environment.apiBaseUrl}/citizen/public-content`;

  constructor(private readonly http: HttpClient) {}

  getCategories(): Observable<FaqCategory[]> {
    return this.http.get<any[]>(`${this.baseUrl}/faq/categories`).pipe(
      map((items) => items.map((item) => ({
        id: item.id,
        code: item.categoryCode,
        name: item.categoryName,
        icon: 'info'
      } satisfies FaqCategory)))
    );
  }

  getFaqsByCategory(categoryId: string): Observable<FaqItem[]> {
    let params = new HttpParams();
    if (categoryId !== 'all') {
      params = params.set('category', categoryId);
    }
    return this.http.get<any[]>(`${this.baseUrl}/faq`, { params }).pipe(
      map((items) => items.map((item) => ({
        id: item.id,
        categoryCode: item.categoryCode,
        question: item.question,
        answer: item.answer
      } satisfies FaqItem)))
    );
  }

  searchFaqs(query: string): Observable<FaqItem[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<any[]>(`${this.baseUrl}/faq`, { params }).pipe(
      map((items) => items.map((item) => ({
        id: item.id,
        categoryCode: item.categoryCode,
        question: item.question,
        answer: item.answer
      } satisfies FaqItem)))
    );
  }
}
