import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, skip } from 'rxjs';
import { ProceduresApiService } from '../../../application/services/procedures-api.service';
import { CalendarService } from '../../../application/services/calendar.service';
import { I18nService } from '../../../application/services/i18n.service';
import { AuthService } from '../../../application/services/auth.service';
import { ProcedureItem } from '../../../application/models/procedure.models';
import { CalendarEvent } from '../../../application/models/sede.models';

import { trackByIndex } from '../../../application/utils/track-by.utils';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, CurrencyPipe, DatePipe } from '@angular/common';
import { SkeletonScreenComponent } from '../../../shared/components/skeleton-screen/skeleton-screen.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-public-home',
    templateUrl: './public-home.component.html',
    styleUrls: ['./public-home.component.css'],
    imports: [RouterLink, NgIf, SkeletonScreenComponent, NgFor, CurrencyPipe, DatePipe, TranslatePipe]
})
export class PublicHomeComponent implements OnInit, OnDestroy {
  procedures: ProcedureItem[] = [];
  upcomingEvents: CalendarEvent[] = [];
  isLoading = true;
  isAuthenticated = false;
  private localeSub?: Subscription;

  protected readonly trackByIndex = trackByIndex;

  constructor(
    private readonly proceduresApi: ProceduresApiService,
    private readonly calendarService: CalendarService,
    private readonly i18nService: I18nService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    // Let the hero text render first; fetch below-the-fold data after the first paint.
    setTimeout(() => this.loadData(), 0);
    // Avoid double-fetch on init if the locale observable emits immediately.
    this.localeSub = this.i18nService.getCurrentLocale$().pipe(skip(1)).subscribe(() => this.loadData());
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
    return new Date(date).toLocaleDateString(this.i18nService.getCurrentLocale(), { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
