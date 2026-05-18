import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  ProcedureItem,
  ProcedureDetail,
  ProcedureTaskDto
} from '../models/procedure.models';
import {
  CaseItem,
  CaseDetail,
  CaseStatusResponse,
  CreateCaseRequest,
  AmendCaseRequest,
  PagedResponse
} from '../models/case.models';

interface StoredMockCase {
  item: CaseItem;
  detail: CaseDetail;
}

@Injectable({ providedIn: 'root' })
export class MockCitizenFlowService {
  private readonly casesKey = 'tfg.mock.cases';
  private readonly latencyMs = 180;

  private readonly procedures: ProcedureDetail[] = [
    {
      id: 'proc-lic-obra-menor',
      slug: 'licencia-obra-menor',
      name: 'Solicitud de licencia de obra menor',
      description: 'Tramitación de licencias para obras de reforma sin alteración estructural.',
      category: 'Urbanismo',
      fee: 85,
      deadline: 30,
      status: 'AVAILABLE',
      tasks: [
        {
          id: 'task-datos-solicitante',
          name: 'Datos del solicitante',
          type: 'form',
          description: 'Completa tus datos personales y de contacto.',
          formFields: [
            { id: 'subject', name: 'CASE_WIZARD.FIELD_SUBJECT', type: 'text', required: true, placeholder: 'CASE_WIZARD.FIELD_SUBJECT_PLACEHOLDER' },
            { id: 'description', name: 'CASE_WIZARD.FIELD_DESCRIPTION', type: 'textarea', required: true, placeholder: 'CASE_WIZARD.FIELD_DESCRIPTION_PLACEHOLDER' },
            { id: 'contactEmail', name: 'CASE_WIZARD.FIELD_CONTACT_EMAIL', type: 'email', required: true, placeholder: 'CASE_WIZARD.FIELD_CONTACT_EMAIL_PLACEHOLDER' },
            { id: 'contactPhone', name: 'CASE_WIZARD.FIELD_CONTACT_PHONE', type: 'phone', required: true, placeholder: 'CASE_WIZARD.FIELD_CONTACT_PHONE_PLACEHOLDER' }
          ]
        },
        {
          id: 'task-documentacion',
          name: 'Documentación obligatoria',
          type: 'upload',
          description: 'Adjunta la documentación mínima exigida para iniciar el expediente.',
          uploadRequirements: [
            { id: 'doc-id', name: 'CASE_WIZARD.UPLOAD_ID', required: true },
            { id: 'doc-supporting', name: 'CASE_WIZARD.UPLOAD_SUPPORTING', required: true }
          ]
        },
        {
          id: 'task-revision',
          name: 'Revisión y envío',
          type: 'review',
          description: 'Revisa toda la información antes de registrar la solicitud.'
        }
      ]
    },
    {
      id: 'proc-empadronamiento',
      slug: 'alta-empadronamiento',
      name: 'Alta en padrón municipal',
      description: 'Alta o cambio de domicilio en el padrón municipal de habitantes.',
      category: 'Padrón',
      fee: 0,
      deadline: 15,
      status: 'AVAILABLE',
      tasks: [
        {
          id: 'task-datos-residencia',
          name: 'Datos de residencia',
          type: 'form',
          description: 'Indica el domicilio y datos de la unidad convivencial.',
          formFields: [
            { id: 'subject', name: 'CASE_WIZARD.FIELD_SUBJECT', type: 'text', required: true, placeholder: 'CASE_WIZARD.FIELD_SUBJECT_PLACEHOLDER' },
            { id: 'description', name: 'CASE_WIZARD.FIELD_DESCRIPTION', type: 'textarea', required: true, placeholder: 'CASE_WIZARD.FIELD_DESCRIPTION_PLACEHOLDER' },
            { id: 'contactEmail', name: 'CASE_WIZARD.FIELD_CONTACT_EMAIL', type: 'email', required: true, placeholder: 'CASE_WIZARD.FIELD_CONTACT_EMAIL_PLACEHOLDER' },
            { id: 'contactPhone', name: 'CASE_WIZARD.FIELD_CONTACT_PHONE', type: 'phone', required: false, placeholder: 'CASE_WIZARD.FIELD_CONTACT_PHONE_PLACEHOLDER' }
          ]
        },
        {
          id: 'task-documentacion-padron',
          name: 'Documentación acreditativa',
          type: 'upload',
          description: 'Adjunta la documentación de identidad y domicilio.',
          uploadRequirements: [
            { id: 'doc-id', name: 'CASE_WIZARD.UPLOAD_ID', required: true },
            { id: 'doc-supporting', name: 'CASE_WIZARD.UPLOAD_SUPPORTING', required: true }
          ]
        },
        {
          id: 'task-revision-padron',
          name: 'Revisión y envío',
          type: 'review',
          description: 'Verifica los datos del alta antes de finalizar.'
        }
      ]
    },
    {
      id: 'proc-certificado-residencia',
      slug: 'certificado-residencia',
      name: 'Certificado de residencia',
      description: 'Solicitud y descarga del certificado de residencia actualizado.',
      category: 'Atención ciudadana',
      fee: 12,
      deadline: 7,
      status: 'AVAILABLE',
      tasks: [
        {
          id: 'task-datos-cert',
          name: 'Datos de solicitud',
          type: 'form',
          description: 'Indica el motivo y canal preferido de recepción.',
          formFields: [
            { id: 'subject', name: 'CASE_WIZARD.FIELD_SUBJECT', type: 'text', required: true, placeholder: 'CASE_WIZARD.FIELD_SUBJECT_PLACEHOLDER' },
            { id: 'description', name: 'CASE_WIZARD.FIELD_DESCRIPTION', type: 'textarea', required: true, placeholder: 'CASE_WIZARD.FIELD_DESCRIPTION_PLACEHOLDER' },
            {
              id: 'contactChannel',
              name: 'CASE_WIZARD.FIELD_CONTACT_CHANNEL',
              type: 'select',
              required: true,
              placeholder: 'CASE_WIZARD.FIELD_CONTACT_CHANNEL_PLACEHOLDER',
              options: [
                { value: 'email', label: 'CASE_WIZARD.FIELD_CONTACT_CHANNEL_EMAIL' },
                { value: 'phone', label: 'CASE_WIZARD.FIELD_CONTACT_CHANNEL_PHONE' }
              ]
            }
          ]
        },
        {
          id: 'task-revision-cert',
          name: 'Revisión y envío',
          type: 'review',
          description: 'Confirma la solicitud para emitir el certificado.'
        }
      ]
    }
  ];

  listProcedures(): Observable<ProcedureItem[]> {
    return of(this.procedures.map((p) => this.toItem(p))).pipe(delay(this.latencyMs));
  }

  getProcedureBySlug(slug: string): Observable<ProcedureDetail> {
    const found = this.procedures.find((p) => p.slug === slug);
    if (!found) {
      throw new Error(`Procedure not found for slug: ${slug}`);
    }
    return of(found).pipe(delay(this.latencyMs));
  }

  getFormSchema(slug: string): Observable<ProcedureTaskDto[]> {
    const found = this.procedures.find((p) => p.slug === slug);
    return of(found?.tasks ?? []).pipe(delay(this.latencyMs));
  }

  getTaskSchema(slug: string, taskId: string): Observable<ProcedureTaskDto> {
    const found = this.procedures.find((p) => p.slug === slug);
    const task = found?.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    return of(task).pipe(delay(this.latencyMs));
  }

  listCases(page: number = 0, size: number = 10): Observable<PagedResponse<CaseItem>> {
    const stored = this.readCases();
    const items = stored.map((s) => s.item).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = page * size;
    const pageItems = items.slice(start, start + size);
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / size));

    return of({
      items: pageItems,
      page,
      size,
      totalItems,
      totalPages
    }).pipe(delay(this.latencyMs));
  }

  getCaseDetail(id: string): Observable<CaseDetail> {
    const found = this.readCases().find((c) => c.item.id === id);
    if (!found) {
      throw new Error(`Case not found: ${id}`);
    }
    return of(found.detail).pipe(delay(this.latencyMs));
  }

  getCaseStatus(id: string): Observable<CaseStatusResponse> {
    const found = this.readCases().find((c) => c.item.id === id);
    if (!found) {
      throw new Error(`Case not found: ${id}`);
    }
    return of({
      id,
      status: found.detail.status,
      currentTask: found.detail.currentTask,
      lastUpdated: found.detail.lastUpdated
    }).pipe(delay(this.latencyMs));
  }

  createCase(request: CreateCaseRequest): Observable<CaseItem> {
    const procedure = this.procedures.find((p) => p.id === request.procedureId || p.slug === request.procedureId);
    const now = new Date().toISOString();
    const caseId = `EXP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const title = request.title || procedure?.name || 'Nuevo expediente';
    const description = typeof request.formData?.['description'] === 'string'
      ? String(request.formData['description'])
      : (procedure?.description ?? 'Expediente creado en modo mock.');

    const item: CaseItem = {
      id: caseId,
      procedureType: procedure?.name ?? request.procedureId,
      status: 'PENDING',
      createdAt: now,
      lastUpdated: now,
      title,
      description,
      assignedUnit: procedure?.category ?? 'Unidad General'
    };

    const detail: CaseDetail = {
      ...item,
      currentTask: 'Borrador creado',
      timeline: [
        {
          id: `${caseId}-tl-1`,
          title: 'Solicitud registrada',
          date: now,
          description: 'El expediente se ha registrado correctamente en la sede electrónica.'
        }
      ],
      attachments: [],
      procedureTypeId: request.procedureId,
      formData: request.formData
    };

    const stored = this.readCases();
    stored.push({ item, detail });
    this.writeCases(stored);

    return of(item).pipe(delay(this.latencyMs));
  }

  submitCase(id: string): Observable<CaseStatusResponse> {
    const stored = this.readCases();
    const found = stored.find((c) => c.item.id === id);
    if (!found) {
      throw new Error(`Case not found: ${id}`);
    }

    const now = new Date().toISOString();
    found.item.status = 'REVIEW';
    found.item.lastUpdated = now;
    found.detail.status = 'REVIEW';
    found.detail.lastUpdated = now;
    found.detail.currentTask = 'Revisión documental';
    found.detail.timeline.push({
      id: `${id}-tl-${found.detail.timeline.length + 1}`,
      title: 'Expediente enviado',
      date: now,
      description: 'La solicitud se ha enviado para su revisión por la unidad gestora.'
    });

    this.writeCases(stored);

    return of({
      id,
      status: 'REVIEW',
      currentTask: 'Revisión documental',
      lastUpdated: now
    }).pipe(delay(this.latencyMs));
  }

  amendCase(id: string, request: AmendCaseRequest): Observable<CaseStatusResponse> {
    const stored = this.readCases();
    const found = stored.find((c) => c.item.id === id);
    if (!found) {
      throw new Error(`Case not found: ${id}`);
    }

    const now = new Date().toISOString();
    found.item.status = 'PENDING';
    found.item.lastUpdated = now;
    found.detail.status = 'PENDING';
    found.detail.lastUpdated = now;
    found.detail.currentTask = 'Aclaración solicitada';
    found.detail.timeline.push({
      id: `${id}-tl-${found.detail.timeline.length + 1}`,
      title: 'Aclaración registrada',
      date: now,
      description: request.reason || 'Se ha registrado una solicitud de aclaración en modo mock.'
    });

    this.writeCases(stored);

    return of({
      id,
      status: 'PENDING',
      currentTask: 'Aclaración solicitada',
      lastUpdated: now
    }).pipe(delay(this.latencyMs));
  }

  private toItem(detail: ProcedureDetail): ProcedureItem {
    return {
      id: detail.id,
      slug: detail.slug,
      name: detail.name,
      description: detail.description,
      category: detail.category,
      fee: detail.fee,
      deadline: detail.deadline,
      status: detail.status
    };
  }

  private readCases(): StoredMockCase[] {
    const raw = localStorage.getItem(this.casesKey);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as StoredMockCase[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeCases(cases: StoredMockCase[]): void {
    localStorage.setItem(this.casesKey, JSON.stringify(cases));
  }
}
