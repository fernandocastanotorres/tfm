import { Component, OnInit } from '@angular/core';
import { ProceduresApiService } from '../../../application/services/procedures-api.service';
import { CalendarService } from '../../../application/services/calendar.service';
import { ServiceStatusService } from '../../../application/services/service-status.service';
import { ProcedureItem } from '../../../application/models/procedure.models';
import { CalendarEvent } from '../../../application/models/sede.models';

@Component({
  selector: 'app-public-home',
  templateUrl: './public-home.component.html',
  styleUrls: ['./public-home.component.css']
})
export class PublicHomeComponent implements OnInit {
  procedures: ProcedureItem[] = [];
  upcomingEvents: CalendarEvent[] = [];
  isLoading = true;

  constructor(
    private readonly proceduresApi: ProceduresApiService,
    private readonly calendarService: CalendarService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.proceduresApi.listAll().subscribe({
      next: (data) => {
        this.procedures = data.slice(0, 6);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });

    this.calendarService.getUpcoming(3).subscribe({
      next: (events) => {
        this.upcomingEvents = events;
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
