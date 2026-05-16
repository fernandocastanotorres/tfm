import { Component, OnInit } from '@angular/core';
import { CalendarService } from '../../../application/services/calendar.service';
import { CalendarEvent } from '../../../application/models/sede.models';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  events: CalendarEvent[] = [];
  selectedType = 'all';
  isLoading = true;

  readonly types = [
    { value: 'all', labelKey: 'CALENDAR.TYPE_ALL' },
    { value: 'deadline', labelKey: 'CALENDAR.TYPE_DEADLINE' },
    { value: 'holiday', labelKey: 'CALENDAR.TYPE_HOLIDAY' },
    { value: 'reminder', labelKey: 'CALENDAR.TYPE_REMINDER' },
    { value: 'info', labelKey: 'CALENDAR.TYPE_INFO' }
  ];

  constructor(private readonly calendarService: CalendarService) {}

  ngOnInit(): void {
    this.loadEvents();
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
