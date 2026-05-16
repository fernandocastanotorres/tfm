import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CasesApiService } from '../../../application/services/cases-api.service';
import { CaseDetail } from '../../../application/models/case.models';

@Component({
  selector: 'app-case-detail',
  templateUrl: './case-detail.component.html',
  styleUrls: []
})
export class CaseDetailComponent implements OnInit {
  caseDetail: CaseDetail | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private readonly casesApiService: CasesApiService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const caseId = this.route.snapshot.paramMap.get('id');
    if (!caseId) {
      this.error = 'CASE_DETAIL.ERROR_NO_ID';
      this.isLoading = false;
      return;
    }

    this.casesApiService.getDetail(caseId).subscribe({
      next: (data) => {
        this.caseDetail = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'CASE_DETAIL.ERROR_LOAD';
        this.isLoading = false;
      }
    });
  }

  statusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
      case 'WAITING':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }
}
