import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MockCitizenFlowService } from './mock-citizen-flow.service';

describe('MockCitizenFlowService', () => {
  let service: MockCitizenFlowService;

  beforeEach(() => {
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
    it('should return form schema for procedure', fakeAsync(() => {
      let result: any;
      service.getFormSchema('licencia-obra-menor').subscribe(schema => { result = schema; });
      tick(180);
      expect(result.length).toBeGreaterThan(0);
    }));
  });

  describe('getTaskSchema', () => {
    it('should return task schema', fakeAsync(() => {
      let result: any;
      service.getTaskSchema('licencia-obra-menor', 'task-datos-solicitante').subscribe(task => { result = task; });
      tick(180);
      expect(result.name).toBeDefined();
    }));
  });
});
