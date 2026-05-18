import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CasesApiService } from '../../../application/services/cases-api.service';
import { CaseDetail } from '../../../application/models/case.models';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-case-detail',
  templateUrl: './case-detail.component.html',
  styleUrls: []
})
export class CaseDetailComponent implements OnInit, OnDestroy {
  caseDetail: CaseDetail | null = null;
  isLoading = true;
  isUploading = false;
  error: string | null = null;
  private caseId: string | null = null;
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly casesApiService: CasesApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.caseId = this.route.snapshot.paramMap.get('id');
    if (!this.caseId) {
      this.error = 'CASE_DETAIL.ERROR_NO_ID';
      this.isLoading = false;
      return;
    }

    this.loadCaseDetail();
    this.subscriptions.add(
      interval(30000).subscribe(() => {
        this.loadCaseDetail(false);
      })
    );

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        this.loadCaseDetail(false);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    this.subscriptions.add({ unsubscribe: () => document.removeEventListener('visibilitychange', onVisibilityChange) });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSelectFiles(files: FileList | null): void {
    if (!files || !this.caseId) {
      return;
    }

    const selectedFiles = Array.from(files);
    if (selectedFiles.length === 0) {
      return;
    }

    this.isUploading = true;
    let pending = selectedFiles.length;

    selectedFiles.forEach((file) => {
      this.casesApiService.uploadDocument(this.caseId!, file).subscribe({
        next: () => {
          pending -= 1;
          if (pending === 0) {
            this.isUploading = false;
            this.loadCaseDetail();
          }
        },
        error: () => {
          pending -= 1;
          this.error = 'CASE_DETAIL.ERROR_LOAD';
          if (pending === 0) {
            this.isUploading = false;
            this.loadCaseDetail();
          }
        }
      });
    });
  }

  downloadDocument(documentId: string, filename: string): void {
    this.casesApiService.downloadDocument(documentId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename || 'documento';
        link.click();
        URL.revokeObjectURL(objectUrl);
      }
    });
  }

  downloadReceipt(): void {
    if (!this.caseDetail) {
      return;
    }

    this.casesApiService.downloadReceipt(this.caseDetail.id).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `justificante-${this.caseDetail!.id}.pdf`;
        link.click();
        URL.revokeObjectURL(objectUrl);
      }
    });
  }

  async requestAmendment(): Promise<void> {
    if (!this.caseDetail) {
      return;
    }

    const confirmed = await this.confirmDialogService.confirm(
      'Solicitar aclaracion',
      'Se enviara una solicitud de aclaracion para este expediente.',
      'Solicitar'
    );

    if (!confirmed) {
      return;
    }

    this.casesApiService.amend(this.caseDetail.id, { reason: 'Solicitud de aclaracion desde sede' }).subscribe({
      next: () => this.loadCaseDetail(),
      error: () => {
        this.error = 'CASE_DETAIL.ERROR_LOAD';
      }
    });
  }

  private loadCaseDetail(showLoader: boolean = true): void {
    if (!this.caseId) {
      return;
    }

    if (showLoader) {
      this.isLoading = true;
    }
    this.casesApiService.getDetail(this.caseId).subscribe({
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

  continueProcessing(): void {
    if (!this.caseDetail) {
      return;
    }

    const procedureId = this.caseDetail.procedureTypeId || this.toSlug(this.caseDetail.procedureType);
    if (!procedureId) {
      this.error = 'CASE_DETAIL.ERROR_RESUME';
      return;
    }

    this.router.navigate(['/sede/expedientes/nuevo', procedureId], {
      queryParams: { caseId: this.caseDetail.id }
    });
  }

  private toSlug(title: string): string {
    return title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
