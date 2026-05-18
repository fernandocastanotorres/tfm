import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MockCitizenFlowService } from './mock-citizen-flow.service';
import {
  ProcedureItem,
  ProcedureDetail,
  ProcedureTaskDto,
  FormFieldDto,
  UploadRequirementDto
} from '../models/procedure.models';

@Injectable({
  providedIn: 'root'
})
export class ProceduresApiService {
  private readonly http = inject(HttpClient);
  private readonly mockCitizenFlowService = inject(MockCitizenFlowService);
  private readonly baseUrl = `${environment.apiBaseUrl}/citizen/procedures/catalog`;

  private toSlug(value: string | null | undefined): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private mapTask(raw: any): ProcedureTaskDto {
    const rawType = typeof raw.type === 'string' ? raw.type.toLowerCase() : '';
    const formFields = this.mapFormFields(raw.formFields ?? raw.fields);
    const uploadRequirements = this.mapUploadRequirements(raw.uploadRequirements);

    return {
      id: raw.id,
      name: raw.title ?? raw.name,
      type: rawType,
      description: raw.description ?? '',
      formFields,
      uploadRequirements
    };
  }

  private mapFormFields(rawFields: any[] | undefined): FormFieldDto[] {
    if (!Array.isArray(rawFields)) {
      return [];
    }

    return rawFields.map((field) => {
      const id = field?.id ?? '';
      const name = field?.name ?? field?.label ?? field?.title ?? id;
      const placeholder = field?.placeholder ?? `Introduce ${name}`;
      return {
        id,
        name,
        type: field?.type ?? 'text',
        required: Boolean(field?.required),
        placeholder,
        options: Array.isArray(field?.options) ? field.options : []
      };
    });
  }

  private mapUploadRequirements(rawRequirements: any[] | undefined): UploadRequirementDto[] {
    if (!Array.isArray(rawRequirements)) {
      return [];
    }

    return rawRequirements.map((requirement) => {
      const id = requirement?.id ?? '';
      return {
        id,
        name: requirement?.name ?? requirement?.label ?? requirement?.title ?? id,
        required: Boolean(requirement?.required)
      };
    });
  }

  private mapProcedure(raw: any): ProcedureItem {
    const title = raw.title ?? raw.name ?? '';
    return {
      id: raw.id,
      slug: raw.slug ?? this.toSlug(title),
      name: title,
      description: raw.description ?? '',
      category: raw.unit ?? 'General',
      fee: raw.feeAmount ?? 0,
      deadline: raw.deadlineDays ?? 0,
      status: raw.status
    };
  }

  private mapProcedureDetail(raw: any): ProcedureDetail {
    return {
      ...this.mapProcedure(raw),
      tasks: (raw.tasks ?? []).map((task: any) => this.mapTask(task))
    };
  }

  /**
   * GET /api/v1/citizen/procedures/catalog — List all available procedures.
   */
  listAll(): Observable<ProcedureItem[]> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.listProcedures();
    }
    return this.http.get<any[]>(this.baseUrl).pipe(
      map((response) => response.map((item) => this.mapProcedure(item)))
    );
  }

  /**
   * GET /api/v1/citizen/procedures/catalog/{slug} — Get procedure detail with tasks.
   */
  getByIdentifier(identifier: string): Observable<ProcedureDetail> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.getProcedureBySlug(identifier);
    }
    return this.http.get<any>(`${this.baseUrl}/${identifier}`).pipe(
      map((response) => this.mapProcedureDetail(response))
    );
  }

  /**
   * GET /api/v1/citizen/procedures/catalog/{slug}/form-schema — Get form schema for procedure.
   */
  getFormSchema(slug: string): Observable<ProcedureTaskDto[]> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.getFormSchema(slug);
    }
    return this.http.get<any[]>(`${this.baseUrl}/${slug}/form-schema`).pipe(
      map((response) => response.map((task) => this.mapTask(task)))
    );
  }

  /**
   * GET /api/v1/citizen/procedures/catalog/{slug}/tasks/{taskId}/schema — Get schema for a specific task.
   */
  getTaskSchema(slug: string, taskId: string): Observable<ProcedureTaskDto> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.getTaskSchema(slug, taskId);
    }
    return this.http.get<any>(`${this.baseUrl}/${slug}/tasks/${taskId}/schema`).pipe(
      map((response) => this.mapTask(response))
    );
  }
}
