import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProceduresApiService } from '../../../application/services/procedures-api.service';
import { CalendarService } from '../../../application/services/calendar.service';
import { I18nService } from '../../../application/services/i18n.service';
import { ProcedureItem } from '../../../application/models/procedure.models';
import { CalendarEvent } from '../../../application/models/sede.models';

@Component({
  selector: 'app-public-home',
  templateUrl: './public-home.component.html',
  styleUrls: ['./public-home.component.css']
})
export class PublicHomeComponent implements OnInit, OnDestroy {
  procedures: ProcedureItem[] = [];
  upcomingEvents: CalendarEvent[] = [];
  isLoading = true;
  private localeSub?: Subscription;

  constructor(
    private readonly proceduresApi: ProceduresApiService,
    private readonly calendarService: CalendarService,
    private readonly i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.localeSub = this.i18nService.getCurrentLocale$().subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.localeSub?.unsubscribe();
  }

  private loadData(): void {
    this.isLoading = true;
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
