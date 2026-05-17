import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { InstitutionalSection } from '../models/sede.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InstitutionalService {
  private readonly baseUrl = `${environment.apiBaseUrl}/citizen/public-content/institutional`;

  constructor(private readonly http: HttpClient) {}

  getAllSections(): Observable<InstitutionalSection[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map((items) => items.map((item) => ({
        id: item.sectionCode,
        title: item.title,
        content: item.content,
        icon: item.icon
      } satisfies InstitutionalSection)))
    );
  }

  getSectionById(id: string): Observable<InstitutionalSection | undefined> {
    return this.getAllSections().pipe(map((sections) => sections.find((section) => section.id === id)));
  }
}
