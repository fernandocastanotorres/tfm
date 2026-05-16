import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CalendarEvent } from '../models/sede.models';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly events: CalendarEvent[] = [
    {
      id: '1',
      titleKey: 'CALENDAR.EVENT_TAX_DEADLINE',
      date: '2026-06-30',
      type: 'deadline',
      descriptionKey: 'CALENDAR.EVENT_TAX_DEADLINE_DESC',
      relatedProcedure: 'tax-payment'
    },
    {
      id: '2',
      titleKey: 'CALENDAR.EVENT_HOLIDAY_MAY',
      date: '2026-05-30',
      type: 'holiday',
      descriptionKey: 'CALENDAR.EVENT_HOLIDAY_MAY_DESC'
    },
    {
      id: '3',
      titleKey: 'CALENDAR.EVENT_REGISTRY_DEADLINE',
      date: '2026-07-15',
      type: 'deadline',
      descriptionKey: 'CALENDAR.EVENT_REGISTRY_DEADLINE_DESC',
      relatedProcedure: 'registry-update'
    },
    {
      id: '4',
      titleKey: 'CALENDAR.EVENT_HOLIDAY_AUGUST',
      date: '2026-08-15',
      type: 'holiday',
      descriptionKey: 'CALENDAR.EVENT_HOLIDAY_AUGUST_DESC'
    },
    {
      id: '5',
      titleKey: 'CALENDAR.EVENT_URBANISM_REMINDER',
      date: '2026-06-15',
      type: 'reminder',
      descriptionKey: 'CALENDAR.EVENT_URBANISM_REMINDER_DESC',
      relatedProcedure: 'urbanism-license'
    },
    {
      id: '6',
      titleKey: 'CALENDAR.EVENT_INFO_SESSION',
      date: '2026-06-01',
      type: 'info',
      descriptionKey: 'CALENDAR.EVENT_INFO_SESSION_DESC'
    },
    {
      id: '7',
      titleKey: 'CALENDAR.EVENT_HOLIDAY_OCTOBER',
      date: '2026-10-12',
      type: 'holiday',
      descriptionKey: 'CALENDAR.EVENT_HOLIDAY_OCTOBER_DESC'
    },
    {
      id: '8',
      titleKey: 'CALENDAR.EVENT_HOLIDAY_NOVEMBER',
      date: '2026-11-01',
      type: 'holiday',
      descriptionKey: 'CALENDAR.EVENT_HOLIDAY_NOVEMBER_DESC'
    },
    {
      id: '9',
      titleKey: 'CALENDAR.EVENT_HOLIDAY_DECEMBER',
      date: '2026-12-06',
      type: 'holiday',
      descriptionKey: 'CALENDAR.EVENT_HOLIDAY_DECEMBER_DESC'
    },
    {
      id: '10',
      titleKey: 'CALENDAR.EVENT_HOLIDAY_DECEMBER_25',
      date: '2026-12-25',
      type: 'holiday',
      descriptionKey: 'CALENDAR.EVENT_HOLIDAY_DECEMBER_25_DESC'
    }
  ];

  getAll(): Observable<CalendarEvent[]> {
    return of(this.events).pipe(delay(300));
  }

  getByType(type: string): Observable<CalendarEvent[]> {
    if (type === 'all') {
      return of(this.events).pipe(delay(300));
    }
    return of(this.events.filter(e => e.type === type)).pipe(delay(300));
  }

  getUpcoming(limit: number = 5): Observable<CalendarEvent[]> {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = this.events
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit);
    return of(upcoming).pipe(delay(300));
  }
}
