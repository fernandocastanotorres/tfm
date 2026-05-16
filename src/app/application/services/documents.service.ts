import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private readonly baseUrl = '/api/v1/documents';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  getById(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  create(payload: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, payload);
  }

  update(id: string | number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string | number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}