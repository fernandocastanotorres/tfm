import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CasesApiService } from '../../../application/services/cases-api.service';
import { MessagesService } from '../../../application/services/messages.service';
import { CaseDetail, RegistryEntryReceipt } from '../../../application/models/case.models';
import { MessageDto } from '../../../application/models/message.models';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';
import { ToastService } from '../../../application/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, interval } from 'rxjs';
import { trackByIndex } from '../../../application/utils/track-by.utils';
import { NgIf, NgClass, NgFor, DatePipe } from '@angular/common';
import { SkeletonScreenComponent } from '../../../shared/components/skeleton-screen/skeleton-screen.component';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-case-detail',
    templateUrl: './case-detail.component.html',
    styleUrls: ['./case-detail.component.css'],
    imports: [NgIf, SkeletonScreenComponent, NgClass, NgFor, FormsModule, DatePipe, TranslatePipe]
})
export class CaseDetailComponent implements OnInit, OnDestroy {

  private static readonly STATUS_POLL_INTERVAL_MS = 30_000;
  private static readonly ERROR_KEY = 'COMMON.ERROR';

  caseDetail: CaseDetail | null = null;
  isLoading = true;
  isUploading = false;
  isDownloadingEni = false;
  registryReceipt: RegistryEntryReceipt | null = null;
  private caseId: string | null = null;
  private readonly subscriptions = new Subscription();

  messages: MessageDto[] = [];
  reply = '';
  isSending = false;
  isLoadingMessages = false;
  messagePage = 0;
  messagePageSize = 20;
  messageTotalPages = 1;

  protected readonly trackByIndex = trackByIndex;

  constructor(
    private readonly casesApiService: CasesApiService,
    private readonly messagesService: MessagesService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly confirmDialogService: ConfirmDialogService,
    private readonly toast: ToastService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.caseId = this.route.snapshot.paramMap.get('id');
    if (!this.caseId) {
      this.toast.error(this.translate.instant(CaseDetailComponent.ERROR_KEY), this.translate.instant('COMMON.ERROR_CASE_IDENTIFY'));
      this.isLoading = false;
      return;
    }

    this.loadCaseDetail();
    this.subscriptions.add(
      interval(CaseDetailComponent.STATUS_POLL_INTERVAL_MS).subscribe(() => {
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
          this.toast.error(this.translate.instant(CaseDetailComponent.ERROR_KEY), this.translate.instant('COMMON.ERROR_DOCUMENT_UPLOAD'));
          if (pending === 0) {
            this.isUploading = false;
            this.loadCaseDetail();
          }
        }
      });
    });
  }

  downloadDocument(documentId: string, filename: string, variant: 'CURRENT' | 'ORIGINAL' | 'SIGNED' = 'CURRENT'): void {
    this.casesApiService.downloadDocument(documentId, variant).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = variant === 'SIGNED' ? `signed-${filename || 'documento'}` : (filename || 'documento');
        link.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: () => {
        this.toast.error(this.translate.instant(CaseDetailComponent.ERROR_KEY), this.translate.instant('COMMON.ERROR_DOCUMENT_DOWNLOAD'));
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
      },
      error: () => {
        this.toast.error(this.translate.instant(CaseDetailComponent.ERROR_KEY), this.translate.instant('COMMON.ERROR_RECEIPT_DOWNLOAD'));
      }
    });
  }

  openRegistryVerification(): void {
    const url = this.registryReceipt?.verificationUrl;
    if (!url) {
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  downloadEniDoc(): void {
    if (!this.caseDetail) {
      return;
    }

    this.isDownloadingEni = true;
    this.casesApiService.downloadEniDoc(this.caseDetail.id).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `expediente-${this.caseDetail!.id}.enidoc`;
        link.click();
        URL.revokeObjectURL(objectUrl);
        this.isDownloadingEni = false;
      },
      error: () => {
        this.toast.error(this.translate.instant(CaseDetailComponent.ERROR_KEY), this.translate.instant('COMMON.ERROR_ENI_DOWNLOAD'));
        this.isDownloadingEni = false;
      }
    });
  }

  isResolved(): boolean {
    if (!this.caseDetail) {
      return false;
    }
    const key = this.toCaseStatusKey(this.caseDetail.status);
    return key === 'APPROVED' || key === 'REJECTED';
  }

  async requestAmendment(): Promise<void> {
    if (!this.caseDetail) {
      return;
    }

    const confirmed = await this.confirmDialogService.confirm(
      this.translate.instant('CASE_DETAIL.CONFIRM_AMENDMENT_TITLE'),
      this.translate.instant('CASE_DETAIL.CONFIRM_AMENDMENT_TEXT'),
      this.translate.instant('CASE_DETAIL.CONFIRM_AMENDMENT_BUTTON')
    );

    if (!confirmed) {
      return;
    }

    this.casesApiService.amend(this.caseDetail.id, { reason: 'Solicitud de aclaracion desde sede' }).subscribe({
      next: () => this.loadCaseDetail(),
      error: () => {
        this.toast.error(this.translate.instant(CaseDetailComponent.ERROR_KEY), this.translate.instant('COMMON.ERROR_REQUEST_AMENDMENT'));
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
        this.loadRegistryReceipt();
        this.loadMessages();
      },
      error: (err) => {
        this.toast.error(this.translate.instant(CaseDetailComponent.ERROR_KEY), err?.error?.message ?? this.translate.instant('COMMON.ERROR_LOAD_CASES'));
        this.isLoading = false;
      }
    });
  }

  private loadRegistryReceipt(): void {
    if (!this.caseId) {
      return;
    }

    this.casesApiService.getRegistryReceipt(this.caseId).subscribe({
      next: (data) => {
        this.registryReceipt = data;
      },
      error: () => {
        this.registryReceipt = null;
      }
    });
  }

  loadMessages(): void {
    if (!this.caseId) {
      return;
    }
    this.isLoadingMessages = true;
    this.messagesService.getThreadMessages(this.caseId, this.messagePage, this.messagePageSize).subscribe({
      next: (response) => {
        this.messages = response.messages;
        this.messageTotalPages = response.totalPages;
        this.isLoadingMessages = false;
      },
      error: () => {
        this.messages = [];
        this.isLoadingMessages = false;
      }
    });
  }

  sendReply(): void {
    if (!this.caseId || !this.reply.trim()) {
      return;
    }
    this.isSending = true;
    this.messagesService.sendMessage(this.caseId, this.reply.trim()).subscribe({
      next: () => {
        this.reply = '';
        this.messagePage = 0;
        this.loadMessages();
        this.isSending = false;
        this.toast.success(this.translate.instant('COMMON.SUCCESS'), this.translate.instant('COMMON.SUCCESS_MESSAGE_SENT'));
      },
      error: () => {
        this.isSending = false;
        this.toast.error(this.translate.instant(CaseDetailComponent.ERROR_KEY), this.translate.instant('COMMON.ERROR_SEND_MESSAGE'));
      }
    });
  }

  downloadMessageAttachment(attachmentId: string, filename: string): void {
    this.messagesService.downloadAttachment(attachmentId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename || 'adjunto';
        link.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: () => {
        this.toast.error(this.translate.instant(CaseDetailComponent.ERROR_KEY), this.translate.instant('COMMON.ERROR_DOWNLOAD_ATTACHMENT'));
      }
    });
  }

  formatMessageDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  changeMessagePage(page: number): void {
    if (page >= 0 && page < this.messageTotalPages) {
      this.messagePage = page;
      this.loadMessages();
    }
  }

  statusClass(status: string): string {
    switch (this.toCaseStatusKey(status)) {
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

  toCaseStatusKey(status: string): string {
    return (status ?? '').trim().replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase();
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  continueProcessing(): void {
    if (!this.caseDetail) {
      return;
    }

    const procedureId = this.caseDetail.procedureTypeId || this.toSlug(this.caseDetail.procedureType);
    if (!procedureId) {
      this.toast.error(this.translate.instant(CaseDetailComponent.ERROR_KEY), this.translate.instant('COMMON.ERROR_CONTINUE_PROCESS'));
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
