import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProceduresApiService } from '../../../application/services/procedures-api.service';
import { I18nService } from '../../../application/services/i18n.service';
import { ProcedureItem } from '../../../application/models/procedure.models';
import { ToastService } from '../../../application/services/toast.service';
import { TranslateService } from '@ngx-translate/core';

import { trackByIndex } from '../../../application/utils/track-by.utils';
import { NgIf, NgFor } from '@angular/common';
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-procedures',
    templateUrl: './procedures.component.html',
    styleUrls: [],
    imports: [RouterLink, NgIf, LoadingSkeletonComponent, NgFor, TranslatePipe]
})
export class ProceduresComponent implements OnInit, OnDestroy {
  procedures: ProcedureItem[] = [];
  isLoading = true;
  private localeSubscription: Subscription | null = null;

  protected readonly trackByIndex = trackByIndex;

  constructor(
    private readonly proceduresApiService: ProceduresApiService,
    private readonly i18nService: I18nService,
    private readonly router: Router,
    private readonly toast: ToastService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.localeSubscription = this.i18nService.getCurrentLocale$().subscribe(() => {
      this.loadProcedures();
    });
  }

  ngOnDestroy(): void {
    this.localeSubscription?.unsubscribe();
  }

  private loadProcedures(): void {
    this.isLoading = true;
    this.proceduresApiService.listAll().subscribe({
      next: (data) => {
        this.procedures = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.toast.error(this.translate.instant('COMMON.ERROR'), err?.error?.message ?? this.translate.instant('COMMON.ERROR_LOAD_PROCEDURES'));
        this.isLoading = false;
      }
    });
  }

  startProcedure(procedure: ProcedureItem): void {
    this.router.navigate(['/sede/expedientes/nuevo', procedure.id]);
  }
}
