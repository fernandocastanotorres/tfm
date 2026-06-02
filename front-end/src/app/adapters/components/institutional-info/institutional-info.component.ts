import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, skip } from 'rxjs';
import { InstitutionalService } from '../../../application/services/institutional.service';
import { I18nService } from '../../../application/services/i18n.service';
import { InstitutionalSection } from '../../../application/models/sede.models';

import { trackByIndex } from '../../../application/utils/track-by.utils';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-institutional-info',
    templateUrl: './institutional-info.component.html',
    styleUrls: ['./institutional-info.component.css'],
    imports: [NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, TranslatePipe]
})
export class InstitutionalInfoComponent implements OnInit, OnDestroy {
  sections: InstitutionalSection[] = [];
  isLoading = true;
  private localeSub?: Subscription;

  protected readonly trackByIndex = trackByIndex;

  constructor(
    private readonly institutionalService: InstitutionalService,
    private readonly i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.loadSections();
    // Avoid double-fetch on init if the locale observable emits immediately.
    this.localeSub = this.i18nService.getCurrentLocale$().pipe(skip(1)).subscribe(() => this.loadSections());
  }

  ngOnDestroy(): void {
    this.localeSub?.unsubscribe();
  }

  loadSections(): void {
    this.isLoading = true;
    this.institutionalService.getAllSections().subscribe({
      next: (sections) => {
        this.sections = sections;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
