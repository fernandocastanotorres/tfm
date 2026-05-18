import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CasesApiService } from '../../../application/services/cases-api.service';
import { I18nService } from '../../../application/services/i18n.service';
import { CaseItem } from '../../../application/models/case.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-case-search',
  templateUrl: './case-search.component.html',
  styleUrls: ['./case-search.component.css']
})
export class CaseSearchComponent implements OnInit, OnDestroy {
  private localeSubscription: Subscription | null = null;
  cases: CaseItem[] = [];
  isLoading = true;
  error: string | null = null;

  readonly searchForm = this.fb.group({
    term: ['']
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly casesApiService: CasesApiService,
    private readonly i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.loadCases();
    this.localeSubscription = this.i18nService.getCurrentLocale$().subscribe(() => {
      this.loadCases();
    });
  }

  ngOnDestroy(): void {
    this.localeSubscription?.unsubscribe();
  }

  private loadCases(): void {
    this.isLoading = true;
    this.error = null;
    this.casesApiService.list(0, 100).subscribe({
      next: (response) => {
        this.cases = response.items;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'CASE_SEARCH.ERROR';
        this.isLoading = false;
      }
    });
  }

  get filteredCases(): CaseItem[] {
    const term = (this.searchForm.value.term ?? '').trim().toLowerCase();
    if (!term) {
      return this.cases;
    }

    return this.cases.filter((item) =>
      item.id.toLowerCase().includes(term)
      || item.title.toLowerCase().includes(term)
      || item.status.toLowerCase().includes(term)
      || item.procedureType.toLowerCase().includes(term)
    );
  }
}
