import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MockCitizenFlowService } from './mock-citizen-flow.service';
import { CreateCaseRequest, AmendCaseRequest } from '../models/case.models';

describe('MockCitizenFlowService', () => {
  let service: MockCitizenFlowService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [MockCitizenFlowService] });
    service = TestBed.inject(MockCitizenFlowService);
  });

  it('should be created', () => { expect(service).toBeTruthy(); });

  describe('listProcedures', () => {
    it('should return procedure list', fakeAsync(() => {
      let result: any;
      service.listProcedures().subscribe(items => { result = items; });
      tick(180);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBeDefined();
    }));
  });

  describe('getFormSchema', () => {
    it('should return form schema for known procedure', fakeAsync(() => {
      let result: any;
      service.getFormSchema('solicitud-de-licencia').subscribe(schema => { result = schema; });
      tick(180);
      expect(result.length).toBeGreaterThan(0);
    }));

    it('should return empty array for unknown procedure', fakeAsync(() => {
      let result: any;
      service.getFormSchema('nonexistent-slug').subscribe(schema => { result = schema; });
      tick(180);
      expect(result).toEqual([]);
    }));
  });

  describe('getTaskSchema', () => {
    it('should return task schema for valid slug and taskId', fakeAsync(() => {
      let result: any;
      service.getTaskSchema('solicitud-de-licencia', 'task-0-license').subscribe(task => { result = task; });
      tick(180);
      expect(result.name).toBeDefined();
      expect(result.id).toBe('task-0-license');
    }));

    it('should throw error when task does not exist', fakeAsync(() => {
      expect(() => {
        service.getTaskSchema('licencia-obra-menor', 'nonexistent-task').subscribe();
      }).toThrowError('Task not found: nonexistent-task');
      tick(180);
    }));

    it('should throw error when procedure does not exist', fakeAsync(() => {
      expect(() => {
        service.getTaskSchema('nonexistent-slug', 'any-task').subscribe();
      }).toThrow();
      tick(180);
    }));
  });

  describe('getProcedureBySlug', () => {
    it('should return procedure detail for valid slug', fakeAsync(() => {
      let result: any;
      service.getProcedureBySlug('solicitud-de-licencia').subscribe(proc => { result = proc; });
      tick(180);
      expect(result.id).toBe('mock-license-application');
      expect(result.slug).toBe('solicitud-de-licencia');
    }));

    it('should throw error when procedure is not found', fakeAsync(() => {
      expect(() => {
        service.getProcedureBySlug('nonexistent-slug').subscribe();
      }).toThrowError('Procedure not found for slug: nonexistent-slug');
      tick(180);
    }));
  });

  describe('getCaseDetail', () => {
    it('should return case detail for existing case', fakeAsync(() => {
      const req: CreateCaseRequest = { procedureId: 'mock-license-application', title: 'Test Case', formData: {} };
      let createdCase: any;
      service.createCase(req).subscribe(c => { createdCase = c; });
      tick(180);

      let detail: any;
      service.getCaseDetail(createdCase.id).subscribe(d => { detail = d; });
      tick(180);
      expect(detail.id).toBe(createdCase.id);
      expect(detail.title).toBe('Test Case');
    }));

    it('should throw error when case is not found', fakeAsync(() => {
      expect(() => {
        service.getCaseDetail('EXP-NONEXISTENT').subscribe();
      }).toThrowError('Case not found: EXP-NONEXISTENT');
      tick(180);
    }));
  });

  describe('getCaseStatus', () => {
    it('should return case status for existing case', fakeAsync(() => {
      const req: CreateCaseRequest = { procedureId: 'mock-license-application', title: 'Status Test', formData: {} };
      let createdCase: any;
      service.createCase(req).subscribe(c => { createdCase = c; });
      tick(180);

      let status: any;
      service.getCaseStatus(createdCase.id).subscribe(s => { status = s; });
      tick(180);
      expect(status.id).toBe(createdCase.id);
      expect(status.status).toBe('PENDING');
    }));

    it('should throw error when case is not found', fakeAsync(() => {
      expect(() => {
        service.getCaseStatus('EXP-MISSING').subscribe();
      }).toThrowError('Case not found: EXP-MISSING');
      tick(180);
    }));
  });

  describe('submitCase', () => {
    it('should submit an existing case and change status to REVIEW', fakeAsync(() => {
      const req: CreateCaseRequest = { procedureId: 'mock-license-application', title: 'Submit Test', formData: {} };
      let createdCase: any;
      service.createCase(req).subscribe(c => { createdCase = c; });
      tick(180);

      let status: any;
      service.submitCase(createdCase.id).subscribe(s => { status = s; });
      tick(180);
      expect(status.status).toBe('REVIEW');
      expect(status.currentTask).toBe('Revisión documental');
    }));

    it('should throw error when submitting non-existent case', fakeAsync(() => {
      expect(() => {
        service.submitCase('EXP-NONEXISTENT').subscribe();
      }).toThrowError('Case not found: EXP-NONEXISTENT');
      tick(180);
    }));
  });

  describe('amendCase', () => {
    it('should amend an existing case with reason', fakeAsync(() => {
      const req: CreateCaseRequest = { procedureId: 'mock-license-application', title: 'Amend Test', formData: {} };
      let createdCase: any;
      service.createCase(req).subscribe(c => { createdCase = c; });
      tick(180);

      service.submitCase(createdCase.id).subscribe();
      tick(180);

      const amendReq: AmendCaseRequest = { reason: 'Missing document' };
      let status: any;
      service.amendCase(createdCase.id, amendReq).subscribe(s => { status = s; });
      tick(180);
      expect(status.status).toBe('PENDING');
      expect(status.currentTask).toBe('Aclaración solicitada');
    }));

    it('should amend case with default description when no formData provided', fakeAsync(() => {
      const req: CreateCaseRequest = { procedureId: 'mock-license-application', title: 'Amend Test 2', formData: {} };
      let createdCase: any;
      service.createCase(req).subscribe(c => { createdCase = c; });
      tick(180);

      service.submitCase(createdCase.id).subscribe();
      tick(180);

      const amendReq: AmendCaseRequest = { reason: '' };
      let status: any;
      service.amendCase(createdCase.id, amendReq).subscribe(s => { status = s; });
      tick(180);
      expect(status.status).toBe('PENDING');
    }));

    it('should throw error when amending non-existent case', fakeAsync(() => {
      expect(() => {
        service.amendCase('EXP-NONEXISTENT', { reason: 'test' }).subscribe();
      }).toThrowError('Case not found: EXP-NONEXISTENT');
      tick(180);
    }));
  });

  describe('createCase', () => {
    it('should create case with explicit title', fakeAsync(() => {
      const req: CreateCaseRequest = { procedureId: 'mock-license-application', title: 'My Custom Title', formData: {} };
      let result: any;
      service.createCase(req).subscribe(c => { result = c; });
      tick(180);
      expect(result.title).toBe('My Custom Title');
      expect(result.status).toBe('PENDING');
    }));

    it('should use procedure name as title when title is empty string', fakeAsync(() => {
      const req: CreateCaseRequest = { procedureId: 'mock-license-application', title: '', formData: {} };
      let result: any;
      service.createCase(req).subscribe(c => { result = c; });
      tick(180);
      expect(result.title).toBe('Solicitud de Licencia');
    }));

    it('should use fallback title when no title and no procedure', fakeAsync(() => {
      const req: CreateCaseRequest = { procedureId: 'unknown-proc', title: '', formData: {} };
      let result: any;
      service.createCase(req).subscribe(c => { result = c; });
      tick(180);
      expect(result.title).toBe('Nuevo expediente');
    }));

    it('should use formData.applicationReason when available', fakeAsync(() => {
      const req: CreateCaseRequest = {
        procedureId: 'mock-license-application',
        title: 'With Reason',
        formData: { applicationReason: 'Custom reason from form' }
      };
      let result: any;
      service.createCase(req).subscribe(c => { result = c; });
      tick(180);
      expect(result.description).toBe('Custom reason from form');
    }));

    it('should use procedure description when formData has no applicationReason', fakeAsync(() => {
      const req: CreateCaseRequest = { procedureId: 'mock-license-application', title: 'No Desc', formData: { other: 'value' } };
      let result: any;
      service.createCase(req).subscribe(c => { result = c; });
      tick(180);
      expect(result.description).toContain('actividad');
    }));

    it('should use fallback description when no procedure and no formData.description', fakeAsync(() => {
      const req: CreateCaseRequest = { procedureId: 'unknown-proc', title: '', formData: {} };
      let result: any;
      service.createCase(req).subscribe(c => { result = c; });
      tick(180);
      expect(result.description).toBe('Expediente creado en modo mock.');
    }));

    it('should use procedure name for procedureType when found', fakeAsync(() => {
      const req: CreateCaseRequest = { procedureId: 'mock-address-update', title: 'Address', formData: {} };
      let result: any;
      service.createCase(req).subscribe(c => { result = c; });
      tick(180);
      expect(result.procedureType).toBe('Actualización de Domicilio');
    }));

    it('should use procedureId as procedureType when procedure not found', fakeAsync(() => {
      const req: CreateCaseRequest = { procedureId: 'unknown-proc', title: '', formData: {} };
      let result: any;
      service.createCase(req).subscribe(c => { result = c; });
      tick(180);
      expect(result.procedureType).toBe('unknown-proc');
    }));

    it('should use procedure category for assignedUnit when found', fakeAsync(() => {
      const req: CreateCaseRequest = { procedureId: 'mock-license-application', title: 'Unit Test', formData: {} };
      let result: any;
      service.createCase(req).subscribe(c => { result = c; });
      tick(180);
      expect(result.assignedUnit).toBe('Unidad de Licencias');
    }));

    it('should use fallback assignedUnit when procedure not found', fakeAsync(() => {
      const req: CreateCaseRequest = { procedureId: 'unknown-proc', title: '', formData: {} };
      let result: any;
      service.createCase(req).subscribe(c => { result = c; });
      tick(180);
      expect(result.assignedUnit).toBe('Unidad General');
    }));

    it('should create case with slug as procedureId', fakeAsync(() => {
      const req: CreateCaseRequest = { procedureId: 'solicitud-de-licencia', title: 'By Slug', formData: {} };
      let result: any;
      service.createCase(req).subscribe(c => { result = c; });
      tick(180);
      expect(result.procedureType).toBe('Solicitud de Licencia');
    }));
  });

  describe('listCases', () => {
    it('should return empty paged response when no cases exist', fakeAsync(() => {
      let result: any;
      service.listCases().subscribe(r => { result = r; });
      tick(180);
      expect(result.items).toEqual([]);
      expect(result.totalItems).toBe(0);
      expect(result.totalPages).toBe(1);
    }));

    it('should return paginated cases sorted by createdAt descending', fakeAsync(() => {
      const req1: CreateCaseRequest = { procedureId: 'mock-license-application', title: 'First', formData: {} };
      service.createCase(req1).subscribe();
      tick(180);
      const req2: CreateCaseRequest = { procedureId: 'mock-address-update', title: 'Second', formData: {} };
      service.createCase(req2).subscribe();
      tick(180);

      let result: any;
      service.listCases().subscribe(r => { result = r; });
      tick(180);
      expect(result.items.length).toBe(2);
      expect(result.items[0].title).toBe('Second');
      expect(result.totalItems).toBe(2);
    }));

    it('should respect page and size parameters', fakeAsync(() => {
      for (let i = 0; i < 5; i++) {
        const req: CreateCaseRequest = { procedureId: 'mock-license-application', title: `Case ${i}`, formData: {} };
        service.createCase(req).subscribe();
        tick(180);
      }

      let result: any;
      service.listCases(0, 2).subscribe(r => { result = r; });
      tick(180);
      expect(result.items.length).toBe(2);
      expect(result.page).toBe(0);
      expect(result.size).toBe(2);
      expect(result.totalItems).toBe(5);
      expect(result.totalPages).toBe(3);
    }));
  });

  describe('readCases / writeCases (localStorage)', () => {
    it('should handle empty localStorage', fakeAsync(() => {
      localStorage.clear();
      let result: any;
      service.listCases().subscribe(r => { result = r; });
      tick(180);
      expect(result.items).toEqual([]);
    }));

    it('should handle invalid JSON in localStorage gracefully', fakeAsync(() => {
      localStorage.setItem('tfm.mock.cases', 'not valid json{{{');
      let result: any;
      service.listCases().subscribe(r => { result = r; });
      tick(180);
      expect(result.items).toEqual([]);
    }));

    it('should handle non-array JSON in localStorage gracefully', fakeAsync(() => {
      localStorage.setItem('tfm.mock.cases', JSON.stringify({ notAnArray: true }));
      let result: any;
      service.listCases().subscribe(r => { result = r; });
      tick(180);
      expect(result.items).toEqual([]);
    }));

    it('should persist cases across listCases calls', fakeAsync(() => {
      const req: CreateCaseRequest = { procedureId: 'mock-license-application', title: 'Persisted Case', formData: {} };
      service.createCase(req).subscribe();
      tick(180);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [MockCitizenFlowService] });
      const freshService = TestBed.inject(MockCitizenFlowService);

      let result: any;
      freshService.listCases().subscribe(r => { result = r; });
      tick(180);
      expect(result.items.length).toBe(1);
      expect(result.items[0].title).toBe('Persisted Case');
    }));
  });
});
