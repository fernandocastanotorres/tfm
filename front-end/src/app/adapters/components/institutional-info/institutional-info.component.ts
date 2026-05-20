import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { InstitutionalService } from '../../../application/services/institutional.service';
import { I18nService } from '../../../application/services/i18n.service';
import { InstitutionalSection } from '../../../application/models/sede.models';

@Component({
    selector: 'app-institutional-info',
    templateUrl: './institutional-info.component.html',
    styleUrls: ['./institutional-info.component.css'],
    standalone: false
})
export class InstitutionalInfoComponent implements OnInit, OnDestroy {
  sections: InstitutionalSection[] = [];
  isLoading = true;
  private localeSub?: Subscription;

  constructor(
    private readonly institutionalService: InstitutionalService,
    private readonly i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.loadSections();
    this.localeSub = this.i18nService.getCurrentLocale$().subscribe(() => {
      this.loadSections();
    });
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
