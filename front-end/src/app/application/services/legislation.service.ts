import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { LegislationItem } from '../models/sede.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LegislationService {
  private readonly baseUrl = `${environment.apiBaseUrl}/citizen/public-content/legislation`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<LegislationItem[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(map((items) => items.map((item) => this.mapItem(item))));
  }

  getByType(type: string): Observable<LegislationItem[]> {
    let params = new HttpParams();
    if (type !== 'all') {
      params = params.set('type', type);
    }
    return this.http.get<any[]>(this.baseUrl, { params }).pipe(map((items) => items.map((item) => this.mapItem(item))));
  }

  getTypes(): Observable<string[]> {
    return this.getAll().pipe(
      map((items) => Array.from(new Set(items.map((item) => item.type)))),
      map((types) => ['all', ...types])
    );
  }

  private mapItem(raw: any): LegislationItem {
    return {
      id: raw.id,
      title: raw.title,
      type: raw.type,
      date: raw.publicationDate,
      description: raw.description,
      externalUrl: raw.externalUrl,
      downloadUrl: raw.downloadUrl
    };
  }
}
