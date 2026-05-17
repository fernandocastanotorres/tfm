import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { GlossaryTerm } from '../models/sede.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GlossaryService {
  private readonly baseUrl = `${environment.apiBaseUrl}/citizen/public-content/resources`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<GlossaryTerm[]> {
    const params = new HttpParams().set('type', 'glossary');
    return this.http.get<any[]>(this.baseUrl, { params }).pipe(map((items) => items.map((item) => this.mapTerm(item))));
  }

  search(query: string): Observable<GlossaryTerm[]> {
    const params = new HttpParams().set('type', 'glossary').set('q', query);
    return this.http.get<any[]>(this.baseUrl, { params }).pipe(map((items) => items.map((item) => this.mapTerm(item))));
  }

  getByLetter(letter: string): Observable<GlossaryTerm[]> {
    return this.getAll().pipe(map((terms) => terms.filter((term) => term.term.charAt(0).toUpperCase() === letter.toUpperCase())));
  }

  getLetters(): Observable<string[]> {
    return this.getAll().pipe(map((terms) => [...new Set(terms.map((term) => term.term.charAt(0).toUpperCase()))].sort()));
  }

  private mapTerm(raw: any): GlossaryTerm {
    return {
      id: raw.id,
      term: raw.title,
      definition: raw.description,
      relatedTerms: raw.content ? String(raw.content).split(',').map((term: string) => term.trim()).filter((term: string) => term.length > 0) : []
    };
  }
}
