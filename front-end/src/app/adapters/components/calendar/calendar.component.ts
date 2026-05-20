import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CalendarService } from '../../../application/services/calendar.service';
import { I18nService } from '../../../application/services/i18n.service';
import { CalendarEvent } from '../../../application/models/sede.models';

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.css'],
    standalone: false
})
export class CalendarComponent implements OnInit, OnDestroy {
  events: CalendarEvent[] = [];
  selectedType = 'all';
  isLoading = true;
  private localeSub?: Subscription;

  readonly types = [
    { value: 'all', labelKey: 'CALENDAR.TYPE_ALL' },
    { value: 'deadline', labelKey: 'CALENDAR.TYPE_DEADLINE' },
    { value: 'holiday', labelKey: 'CALENDAR.TYPE_HOLIDAY' },
    { value: 'reminder', labelKey: 'CALENDAR.TYPE_REMINDER' },
    { value: 'info', labelKey: 'CALENDAR.TYPE_INFO' }
  ];

  constructor(
    private readonly calendarService: CalendarService,
    private readonly i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.localeSub = this.i18nService.getCurrentLocale$().subscribe(() => {
      this.loadEvents();
    });
  }

  ngOnDestroy(): void {
    this.localeSub?.unsubscribe();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.calendarService.getByType(this.selectedType).subscribe({
      next: (data) => {
        this.events = data.sort((a, b) => a.date.localeCompare(b.date));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onTypeChange(type: string): void {
    this.selectedType = type;
    this.loadEvents();
  }

  getTypeClass(type: string): string {
    const classes: Record<string, string> = {
      'deadline': 'calendar__type--deadline',
      'holiday': 'calendar__type--holiday',
      'reminder': 'calendar__type--reminder',
      'info': 'calendar__type--info'
    };
    return classes[type] || '';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
}
