import { Component, OnInit } from '@angular/core';
import { CaseDetailService, CaseDetail } from '../../../application/services/case-detail.service';

@Component({
  selector: 'app-case-detail',
  templateUrl: './case-detail.component.html',
  styleUrls: []
})
export class CaseDetailComponent implements OnInit {
  caseDetail: CaseDetail | null = null;

  constructor(private readonly caseDetailService: CaseDetailService) {}

  ngOnInit(): void {
    this.caseDetail = this.caseDetailService.getCaseDetail();
  }

  statusClass(statusKey: string): string {
    switch (statusKey) {
      case 'CASE_STATUS.APPROVED':
        return 'bg-green-100 text-green-700';
      case 'CASE_STATUS.PENDING':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }
}
