import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CalendarEvent } from '../models/sede.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly baseUrl = `${environment.apiBaseUrl}/citizen/public-content/calendar`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<CalendarEvent[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(map((items) => items.map((item) => this.mapEvent(item))));
  }

  getByType(type: string): Observable<CalendarEvent[]> {
    let params = new HttpParams();
    if (type !== 'all') {
      params = params.set('type', type);
    }
    return this.http.get<any[]>(this.baseUrl, { params }).pipe(map((items) => items.map((item) => this.mapEvent(item))));
  }

  getUpcoming(limit: number = 5): Observable<CalendarEvent[]> {
    const params = new HttpParams().set('upcomingLimit', limit);
    return this.http.get<any[]>(this.baseUrl, { params }).pipe(map((items) => items.map((item) => this.mapEvent(item))));
  }

  private mapEvent(raw: any): CalendarEvent {
    return {
      id: raw.id,
      title: raw.title,
      date: raw.eventDate,
      type: raw.type,
      description: raw.description,
      relatedProcedure: raw.relatedProcedure
    };
  }
}
