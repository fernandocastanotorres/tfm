import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DocumentItem, DocumentDetail } from '../models/document.models';

/**
 * Metadata sent alongside a document upload.
 */
export interface UploadMetadata {
  description?: string;
  category?: string;
}

/**
 * Response from a document upload operation.
 */
export interface UploadResponse {
  document: DocumentItem;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentsApiService {
  private readonly http = inject(HttpClient);
  private readonly citizenBase = `${environment.apiBaseUrl}/citizen/procedures`;
  private readonly documentsBase = `${environment.apiBaseUrl}/citizen/procedures/documents`;

  /**
   * POST /api/v1/citizen/procedures/{caseId}/documents — Upload a document (multipart).
   * Returns an Observable that emits HttpProgressEvent for progress tracking,
   * and completes with the uploaded DocumentItem.
   */
  upload(
    caseId: string,
    file: File,
    metadata?: UploadMetadata
  ): Observable<HttpProgressEvent | DocumentItem> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    if (metadata?.description) {
      formData.append('description', metadata.description);
    }
    if (metadata?.category) {
      formData.append('category', metadata.category);
    }

    return this.http
      .post<UploadResponse>(`${this.citizenBase}/${caseId}/documents`, formData, {
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        map((event) => {
          if (event.type === HttpEventType.Response) {
            return event.body?.document as DocumentItem;
          }
          return event as HttpProgressEvent;
        })
      );
  }

  /**
   * GET /api/v1/citizen/procedures/{caseId}/documents — List documents for a case.
   */
  listByCase(caseId: string): Observable<DocumentItem[]> {
    return this.http.get<DocumentItem[]>(`${this.citizenBase}/${caseId}/documents`);
  }

  /**
   * GET /api/v1/citizen/procedures/{procedureUuid}/documents/{docUuid} — Get document detail.
   */
  getDetail(procedureUuid: string, docUuid: string): Observable<DocumentDetail> {
    return this.http.get<DocumentDetail>(
      `${this.citizenBase}/${procedureUuid}/documents/${docUuid}`
    );
  }

  /**
   * GET /api/v1/citizen/procedures/documents/{id}/download — Download a document as Blob.
   */
  download(docId: string): Observable<Blob> {
    return this.http.get(`${this.documentsBase}/${docId}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * DELETE /api/v1/citizen/procedures/documents/{id} — Delete a document.
   */
  delete(docId: string): Observable<void> {
    return this.http.delete<void>(`${this.documentsBase}/${docId}`);
  }
}
