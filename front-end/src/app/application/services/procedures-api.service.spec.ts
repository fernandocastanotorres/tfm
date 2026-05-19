import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProceduresApiService } from './procedures-api.service';
import { MockCitizenFlowService } from './mock-citizen-flow.service';
import { environment } from '../../../environments/environment';

describe('ProceduresApiService', () => {
  let service: ProceduresApiService;
  let httpMock: HttpTestingController;

  const originalUseMock = environment.useMockCitizenFlow;

  beforeEach(() => {
    environment.useMockCitizenFlow = false;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProceduresApiService, MockCitizenFlowService]
    });
    service = TestBed.inject(ProceduresApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    environment.useMockCitizenFlow = originalUseMock;
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listAll', () => {
    it('should GET /citizen/procedures/catalog', (done) => {
      const mockProcedures = [
        { id: 'p-1', title: 'Licencia', description: 'Test', status: 'active', category: 'Urbanismo' }
      ];

      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures.length).toBe(1);
          expect(procedures[0].id).toBe('p-1');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProcedures);
    });

    it('should map procedure items with slug', (done) => {
      const raw = [{ id: 'p-1', title: 'Licencia de Obras', description: 'Desc', status: 'active', category: 'Urbanismo' }];

      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures[0].slug).toBe('licencia-de-obras');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog`).flush(raw);
    });
  });

  describe('getBySlug', () => {
    it('should GET /citizen/procedures/catalog/{slug}', (done) => {
      const raw = {
        id: 'p-1', title: 'Licencia', description: 'Desc', status: 'active',
        tasks: [
          { id: 't-1', title: 'Form', type: 'form', description: 'Fill form', formFields: [{ id: 'name', name: 'Name', type: 'text' }] }
        ]
      };

      service.getByIdentifier('licencia').subscribe({
        next: (detail: any) => {
          expect(detail.id).toBe('p-1');
          expect(detail.tasks.length).toBe(1);
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/licencia`).flush(raw);
    });

    it('should map tasks with form fields', (done) => {
      const raw = {
        id: 'p-1', title: 'Test', description: 'Desc', status: 'active',
        tasks: [{ id: 't-1', title: 'Form Task', type: 'FORM', description: 'Fill', formFields: [{ id: 'email', name: 'Email', type: 'email', required: true }] }]
      };

      service.getByIdentifier('test').subscribe({
        next: (detail: any) => {
          const task = detail.tasks[0];
          expect(task.name).toBe('Form Task');
          expect(task.type).toBe('form');
          expect(task.formFields.length).toBe(1);
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/test`).flush(raw);
    });
  });

  describe('getFormSchema', () => {
    it('should GET form schema for a procedure', (done) => {
      const schema = [{ id: 'f-1', name: 'Name', type: 'text', description: '', formFields: [], uploadRequirements: [] }];

      service.getFormSchema('licencia').subscribe({
        next: (result) => {
          expect(result.length).toBe(1);
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/licencia/form-schema`).flush(schema);
    });
  });
});
