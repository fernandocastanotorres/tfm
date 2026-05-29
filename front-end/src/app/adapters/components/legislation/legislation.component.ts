import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, skip } from 'rxjs';
import { LegislationService } from '../../../application/services/legislation.service';
import { I18nService } from '../../../application/services/i18n.service';
import { LegislationItem } from '../../../application/models/sede.models';

import { trackByIndex } from '../../../application/utils/track-by.utils';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-legislation',
    templateUrl: './legislation.component.html',
    styleUrls: ['./legislation.component.css'],
    imports: [RouterLink, NgFor, FormsModule, NgIf, NgClass, TranslatePipe]
})
export class LegislationComponent implements OnInit, OnDestroy {
  legislation: LegislationItem[] = [];
  types: string[] = [];
  selectedType = 'all';
  isLoading = true;
  private localeSub?: Subscription;

  protected readonly trackByIndex = trackByIndex;

  constructor(
    private readonly legislationService: LegislationService,
    private readonly i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.loadData();
    // Avoid double-fetch on init if the locale observable emits immediately.
    this.localeSub = this.i18nService.getCurrentLocale$().pipe(skip(1)).subscribe(() => this.loadData());
  }

  ngOnDestroy(): void {
    this.localeSub?.unsubscribe();
  }

  loadData(): void {
    this.isLoading = true;
    this.legislationService.getTypes().subscribe((types) => {
      this.types = types;
    });
    this.loadLegislation();
  }

  loadLegislation(): void {
    this.isLoading = true;
    this.legislationService.getByType(this.selectedType).subscribe({
      next: (data) => {
        this.legislation = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onTypeChange(type: string): void {
    this.selectedType = type;
    this.loadLegislation();
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'all': 'LEGISLATION.TYPE_ALL',
      'law': 'LEGISLATION.TYPE_LAW',
      'decree': 'LEGISLATION.TYPE_DECREE',
      'order': 'LEGISLATION.TYPE_ORDER',
      'resolution': 'LEGISLATION.TYPE_RESOLUTION'
    };
    return labels[type] || type;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
