import { Component } from '@angular/core';
import { SignatureApiService, PublicCsvVerificationInfo, SignatureInfo } from '../../../application/services/signature-api.service';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-document-verification',
    templateUrl: './document-verification.component.html',
    styleUrls: ['./document-verification.component.css'],
    imports: [NgIf, NgClass, FormsModule, DatePipe, TranslateModule]
})
export class DocumentVerificationComponent {
  csvCode = '';
  fileVerificationResult: SignatureInfo | null = null;
  csvVerificationResult: PublicCsvVerificationInfo | null = null;
  errorMessage: string | null = null;
  isVerifyingFile = false;
  isVerifyingCsv = false;

  constructor(
    private readonly signatureApiService: SignatureApiService,
    private readonly route: ActivatedRoute,
    private readonly translate: TranslateService
  ) {
    const csv = this.route.snapshot.queryParamMap.get('csv');
    if (csv) {
      this.csvCode = csv;
      this.verifyCsv();
    }
  }

  verifyFile(files: FileList | null): void {
    const file = files?.item(0);
    if (!file) {
      return;
    }

    this.isVerifyingFile = true;
    this.errorMessage = null;
    this.fileVerificationResult = null;

    this.signatureApiService.verifyPublicFile(file).subscribe({
      next: (result) => {
        this.fileVerificationResult = result;
        this.isVerifyingFile = false;
      },
      error: () => {
        this.errorMessage = this.translate.instant('DOCUMENT_VERIFICATION.ERROR_FILE');
        this.isVerifyingFile = false;
      }
    });
  }

  verifyCsv(): void {
    const value = this.csvCode.trim();
    if (!value) {
      return;
    }

    this.isVerifyingCsv = true;
    this.errorMessage = null;
    this.csvVerificationResult = null;

    this.signatureApiService.verifyByCsv(value).subscribe({
      next: (result) => {
        this.csvVerificationResult = result;
        this.isVerifyingCsv = false;
      },
      error: () => {
        this.errorMessage = this.translate.instant('DOCUMENT_VERIFICATION.ERROR_CSV');
        this.isVerifyingCsv = false;
      }
    });
  }
}
