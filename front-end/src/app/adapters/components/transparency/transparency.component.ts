import { Component, OnInit } from '@angular/core';
import { TransparencyService } from '../../../application/services/transparency.service';
import { TransparencyMetric, TransparencyReport } from '../../../application/models/sede.models';

import { trackByIndex } from '../../../application/utils/track-by.utils';

@Component({
    selector: 'app-transparency',
    templateUrl: './transparency.component.html',
    styleUrls: ['./transparency.component.css'],
    standalone: false
})
export class TransparencyComponent implements OnInit {
  metrics: TransparencyMetric[] = [];
  reports: TransparencyReport[] = [];
  isLoading = true;

  protected readonly trackByIndex = trackByIndex;

  constructor(private readonly transparencyService: TransparencyService) {}

  ngOnInit(): void {
    this.transparencyService.getMetrics().subscribe((metrics) => {
      this.metrics = metrics;
    });
    this.transparencyService.getReports().subscribe({
      next: (reports) => {
        this.reports = reports;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getTrendIcon(trend?: string): string {
    switch (trend) {
      case 'up': return '&#8593;';
      case 'down': return '&#8595;';
      default: return '&#8594;';
    }
  }

  getTrendLabel(trend?: string): string {
    switch (trend) {
      case 'up': return 'TRANSPARENCY.TREND_UP';
      case 'down': return 'TRANSPARENCY.TREND_DOWN';
      default: return 'TRANSPARENCY.TREND_STABLE';
    }
  }
}
