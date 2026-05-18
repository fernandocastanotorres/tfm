import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CasesApiService } from '../../../application/services/cases-api.service';
import { CaseItem } from '../../../application/models/case.models';

@Component({
  selector: 'app-case-search',
  templateUrl: './case-search.component.html',
  styleUrls: ['./case-search.component.css']
})
export class CaseSearchComponent implements OnInit {
  cases: CaseItem[] = [];
  isLoading = true;
  error: string | null = null;

  readonly searchForm = this.fb.group({
    term: ['']
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly casesApiService: CasesApiService
  ) {}

  ngOnInit(): void {
    this.casesApiService.list(0, 100).subscribe({
      next: (response) => {
        this.cases = response.items;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar tus expedientes.';
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
