import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { OrganismItem } from '../models/sede.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrganismsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/citizen/public-content/organisms`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<OrganismItem[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(map((items) => items.map((item) => this.mapOrganism(item))));
  }

  getByCategory(category: string): Observable<OrganismItem[]> {
    let params = new HttpParams();
    if (category !== 'all') {
      params = params.set('category', category);
    }
    return this.http.get<any[]>(this.baseUrl, { params }).pipe(map((items) => items.map((item) => this.mapOrganism(item))));
  }

  getCategories(): Observable<string[]> {
    return this.getAll().pipe(map((items) => ['all', ...Array.from(new Set(items.map((item) => item.category)))]));
  }

  search(query: string): Observable<OrganismItem[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<any[]>(this.baseUrl, { params }).pipe(map((items) => items.map((item) => this.mapOrganism(item))));
  }

  private mapOrganism(raw: any): OrganismItem {
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      category: raw.categoryCode,
      phone: raw.phone,
      email: raw.email,
      address: raw.address,
      websiteUrl: raw.websiteUrl
    };
  }
}
