import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SignatureInfo {
  valid: boolean;
  filename: string;
  message: string;
}

export interface DigestInfo {
  algorithm: string;
  digest: string;
  filename: string;
}

export interface CertificateInfo {
  subject: string;
  type: string;
  algorithm: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignatureApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/citizen/signatures`;

  signDocument(file: File): Observable<Blob> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`${this.base}/sign`, formData, {
      responseType: 'blob'
    });
  }

  verifySignature(file: File): Observable<SignatureInfo> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<any>(`${this.base}/verify`, formData).pipe(
      map((response) => ({
        valid: response.valid,
        filename: response.filename,
        message: response.message
      }))
    );
  }

  computeDigest(file: File): Observable<DigestInfo> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<any>(`${this.base}/digest`, formData).pipe(
      map((response) => ({
        algorithm: response.algorithm,
        digest: response.digest,
        filename: response.filename
      }))
    );
  }

  getCertificateInfo(): Observable<CertificateInfo> {
    return this.http.get<any>(`${this.base}/certificate-info`).pipe(
      map((response) => ({
        subject: response.subject,
        type: response.type,
        algorithm: response.algorithm
      }))
    );
  }
}
