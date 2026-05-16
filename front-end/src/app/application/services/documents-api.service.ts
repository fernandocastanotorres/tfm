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

  private mapDocumentItem(raw: any): DocumentItem {
    return {
      id: raw.id,
      caseId: raw.caseId,
      name: raw.name,
      type: raw.type ?? raw.mimeType,
      size: raw.size,
      status: raw.status,
      uploadedAt: raw.uploadedAt
    };
  }

  private mapDocumentDetail(raw: any): DocumentDetail {
    return {
      id: raw.id,
      caseId: raw.caseId,
      name: raw.name,
      type: raw.type ?? raw.mimeType,
      size: raw.size,
      status: raw.status,
      uploadedAt: raw.uploadedAt,
      checksum: raw.checksum ?? '',
      version: raw.version ?? 1
    };
  }

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
      .post<any>(`${this.citizenBase}/${caseId}/documents`, formData, {
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        map((event) => {
          if (event.type === HttpEventType.Response) {
            const body: any = event.body;
            const payload = body?.document ?? body;
            return this.mapDocumentItem(payload);
          }
          return event as HttpProgressEvent;
        })
      );
  }

  /**
   * GET /api/v1/citizen/procedures/{caseId}/documents — List documents for a case.
   */
  listByCase(caseId: string): Observable<DocumentItem[]> {
    return this.http.get<any[]>(`${this.citizenBase}/${caseId}/documents`).pipe(
      map((response) => response.map((item) => this.mapDocumentItem(item)))
    );
  }

  /**
   * GET /api/v1/citizen/procedures/{procedureUuid}/documents/{docUuid} — Get document detail.
   */
  getDetail(procedureUuid: string, docUuid: string): Observable<DocumentDetail> {
    return this.http.get<any>(
      `${this.citizenBase}/${procedureUuid}/documents/${docUuid}`
    ).pipe(
      map((response) => this.mapDocumentDetail(response))
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
