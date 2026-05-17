import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PublicCalendarEntry,
  PublicCalendarUpsertRequest,
  PublicFaqCategoryEntry,
  PublicFaqCategoryUpsertRequest,
  PublicFaqEntry,
  PublicFaqUpsertRequest,
  PublicInstitutionalEntry,
  PublicInstitutionalUpsertRequest,
  PublicLegislationEntry,
  PublicLegislationUpsertRequest,
  PublicOrganismEntry,
  PublicOrganismUpsertRequest,
  PublicResourceEntry,
  PublicResourceUpsertRequest,
  ThemeCatalog,
  ThemePaletteUpsertRequest
} from '../models/backoffice.models';

@Injectable({ providedIn: 'root' })
export class PublicContentManagementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin/public-content`;

  listLegislation(): Observable<PublicLegislationEntry[]> {
    return this.http.get<PublicLegislationEntry[]>(`${this.baseUrl}/legislation`);
  }

  createLegislation(request: PublicLegislationUpsertRequest): Observable<PublicLegislationEntry> {
    return this.http.post<PublicLegislationEntry>(`${this.baseUrl}/legislation`, request);
  }

  updateLegislation(id: string, request: PublicLegislationUpsertRequest): Observable<PublicLegislationEntry> {
    return this.http.put<PublicLegislationEntry>(`${this.baseUrl}/legislation/${id}`, request);
  }

  listLegislationTranslations(id: string): Observable<PublicLegislationEntry[]> {
    return this.http.get<PublicLegislationEntry[]>(`${this.baseUrl}/legislation/${id}/translations`);
  }

  deleteLegislation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/legislation/${id}`);
  }

  listFaqCategories(): Observable<PublicFaqCategoryEntry[]> {
    return this.http.get<PublicFaqCategoryEntry[]>(`${this.baseUrl}/faq/categories`);
  }

  createFaqCategory(request: PublicFaqCategoryUpsertRequest): Observable<PublicFaqCategoryEntry> {
    return this.http.post<PublicFaqCategoryEntry>(`${this.baseUrl}/faq/categories`, request);
  }

  updateFaqCategory(id: string, request: PublicFaqCategoryUpsertRequest): Observable<PublicFaqCategoryEntry> {
    return this.http.put<PublicFaqCategoryEntry>(`${this.baseUrl}/faq/categories/${id}`, request);
  }

  listFaqCategoryTranslations(id: string): Observable<PublicFaqCategoryEntry[]> {
    return this.http.get<PublicFaqCategoryEntry[]>(`${this.baseUrl}/faq/categories/${id}/translations`);
  }

  deleteFaqCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/faq/categories/${id}`);
  }

  listFaqEntries(): Observable<PublicFaqEntry[]> {
    return this.http.get<PublicFaqEntry[]>(`${this.baseUrl}/faq`);
  }

  createFaqEntry(request: PublicFaqUpsertRequest): Observable<PublicFaqEntry> {
    return this.http.post<PublicFaqEntry>(`${this.baseUrl}/faq`, request);
  }

  updateFaqEntry(id: string, request: PublicFaqUpsertRequest): Observable<PublicFaqEntry> {
    return this.http.put<PublicFaqEntry>(`${this.baseUrl}/faq/${id}`, request);
  }

  listFaqTranslations(id: string): Observable<PublicFaqEntry[]> {
    return this.http.get<PublicFaqEntry[]>(`${this.baseUrl}/faq/${id}/translations`);
  }

  deleteFaqEntry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/faq/${id}`);
  }

  listCalendarEntries(): Observable<PublicCalendarEntry[]> {
    return this.http.get<PublicCalendarEntry[]>(`${this.baseUrl}/calendar`);
  }

  createCalendarEntry(request: PublicCalendarUpsertRequest): Observable<PublicCalendarEntry> {
    return this.http.post<PublicCalendarEntry>(`${this.baseUrl}/calendar`, request);
  }

  updateCalendarEntry(id: string, request: PublicCalendarUpsertRequest): Observable<PublicCalendarEntry> {
    return this.http.put<PublicCalendarEntry>(`${this.baseUrl}/calendar/${id}`, request);
  }

  listCalendarTranslations(id: string): Observable<PublicCalendarEntry[]> {
    return this.http.get<PublicCalendarEntry[]>(`${this.baseUrl}/calendar/${id}/translations`);
  }

  deleteCalendarEntry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/calendar/${id}`);
  }

  listInstitutional(): Observable<PublicInstitutionalEntry[]> {
    return this.http.get<PublicInstitutionalEntry[]>(`${this.baseUrl}/institutional`);
  }

  createInstitutional(request: PublicInstitutionalUpsertRequest): Observable<PublicInstitutionalEntry> {
    return this.http.post<PublicInstitutionalEntry>(`${this.baseUrl}/institutional`, request);
  }

  updateInstitutional(id: string, request: PublicInstitutionalUpsertRequest): Observable<PublicInstitutionalEntry> {
    return this.http.put<PublicInstitutionalEntry>(`${this.baseUrl}/institutional/${id}`, request);
  }

  listInstitutionalTranslations(id: string): Observable<PublicInstitutionalEntry[]> {
    return this.http.get<PublicInstitutionalEntry[]>(`${this.baseUrl}/institutional/${id}/translations`);
  }

  deleteInstitutional(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/institutional/${id}`);
  }

  listOrganisms(): Observable<PublicOrganismEntry[]> {
    return this.http.get<PublicOrganismEntry[]>(`${this.baseUrl}/organisms`);
  }

  listOrganismCategories(): Observable<PublicFaqCategoryEntry[]> {
    return this.http.get<PublicFaqCategoryEntry[]>(`${this.baseUrl}/organism-categories`);
  }

  createOrganism(request: PublicOrganismUpsertRequest): Observable<PublicOrganismEntry> {
    return this.http.post<PublicOrganismEntry>(`${this.baseUrl}/organisms`, request);
  }

  updateOrganism(id: string, request: PublicOrganismUpsertRequest): Observable<PublicOrganismEntry> {
    return this.http.put<PublicOrganismEntry>(`${this.baseUrl}/organisms/${id}`, request);
  }

  listOrganismTranslations(id: string): Observable<PublicOrganismEntry[]> {
    return this.http.get<PublicOrganismEntry[]>(`${this.baseUrl}/organisms/${id}/translations`);
  }

  deleteOrganism(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/organisms/${id}`);
  }

  listResources(): Observable<PublicResourceEntry[]> {
    return this.http.get<PublicResourceEntry[]>(`${this.baseUrl}/resources`);
  }

  createResource(request: PublicResourceUpsertRequest): Observable<PublicResourceEntry> {
    return this.http.post<PublicResourceEntry>(`${this.baseUrl}/resources`, request);
  }

  updateResource(id: string, request: PublicResourceUpsertRequest): Observable<PublicResourceEntry> {
    return this.http.put<PublicResourceEntry>(`${this.baseUrl}/resources/${id}`, request);
  }

  listResourceTranslations(id: string): Observable<PublicResourceEntry[]> {
    return this.http.get<PublicResourceEntry[]>(`${this.baseUrl}/resources/${id}/translations`);
  }

  deleteResource(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/resources/${id}`);
  }

  getThemePalette(): Observable<ThemeCatalog> {
    return this.http.get<ThemeCatalog>(`${this.baseUrl}/theme`);
  }

  saveThemePalette(request: ThemePaletteUpsertRequest): Observable<ThemeCatalog> {
    return this.http.put<ThemeCatalog>(`${this.baseUrl}/theme`, request);
  }
}
