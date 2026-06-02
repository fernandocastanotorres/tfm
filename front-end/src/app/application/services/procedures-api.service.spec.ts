import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProceduresApiService } from './procedures-api.service';
import { MockCitizenFlowService } from './mock-citizen-flow.service';
import { environment } from '../../../environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProceduresApiService', () => {
  let service: ProceduresApiService;
  let httpMock: HttpTestingController;

  const originalUseMock = environment.useMockCitizenFlow;

  beforeEach(() => {
    environment.useMockCitizenFlow = false;
    TestBed.configureTestingModule({
    imports: [],
    providers: [ProceduresApiService, MockCitizenFlowService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
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

    it('should use name field when title is missing', (done) => {
      const raw = [{ id: 'p-1', name: 'Procedure by Name', description: 'Desc', status: 'active' }];

      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures[0].name).toBe('Procedure by Name');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog`).flush(raw);
    });

    it('should default description to empty string when missing', (done) => {
      const raw = [{ id: 'p-1', title: 'Test', status: 'active' }];

      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures[0].description).toBe('');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog`).flush(raw);
    });

    it('should default category to General when unit is missing', (done) => {
      const raw = [{ id: 'p-1', title: 'Test', status: 'active' }];

      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures[0].category).toBe('General');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog`).flush(raw);
    });

    it('should default fee to 0 when feeAmount is missing', (done) => {
      const raw = [{ id: 'p-1', title: 'Test', status: 'active' }];

      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures[0].fee).toBe(0);
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog`).flush(raw);
    });

    it('should default deadline to 0 when deadlineDays is missing', (done) => {
      const raw = [{ id: 'p-1', title: 'Test', status: 'active' }];

      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures[0].deadline).toBe(0);
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog`).flush(raw);
    });

    it('should generate slug from title when slug is missing', (done) => {
      const raw = [{ id: 'p-1', title: 'Certificado de Residencia', status: 'active' }];

      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures[0].slug).toBe('certificado-de-residencia');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog`).flush(raw);
    });

    it('should use existing slug when provided', (done) => {
      const raw = [{ id: 'p-1', title: 'Some Title', slug: 'custom-slug', status: 'active' }];

      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures[0].slug).toBe('custom-slug');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog`).flush(raw);
    });

    it('should delegate to mock service when useMockCitizenFlow is true', fakeAsync(() => {
      environment.useMockCitizenFlow = true;
      let result: any;
      service.listAll().subscribe(r => { result = r; });
      tick(180);
      expect(result.length).toBeGreaterThan(0);
    }));
  });

  describe('getByIdentifier', () => {
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

    it('should map tasks with empty formFields when none provided', (done) => {
      const raw = {
        id: 'p-1', title: 'Test', description: 'Desc', status: 'active',
        tasks: [{ id: 't-1', title: 'Review', type: 'review', description: 'Review step' }]
      };

      service.getByIdentifier('test').subscribe({
        next: (detail: any) => {
          const task = detail.tasks[0];
          expect(task.formFields).toEqual([]);
          expect(task.uploadRequirements).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/test`).flush(raw);
    });

    it('should map tasks with empty tasks array when none provided', (done) => {
      const raw = { id: 'p-1', title: 'Test', description: 'Desc', status: 'active' };

      service.getByIdentifier('test').subscribe({
        next: (detail: any) => {
          expect(detail.tasks).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/test`).flush(raw);
    });

    it('should use name field when title is missing in task', (done) => {
      const raw = {
        id: 'p-1', title: 'Test', status: 'active',
        tasks: [{ id: 't-1', name: 'Task by Name', type: 'form', description: '' }]
      };

      service.getByIdentifier('test').subscribe({
        next: (detail: any) => {
          expect(detail.tasks[0].name).toBe('Task by Name');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/test`).flush(raw);
    });

    it('should handle task type as non-string', (done) => {
      const raw = {
        id: 'p-1', title: 'Test', status: 'active',
        tasks: [{ id: 't-1', title: 'Task', type: 123, description: '' }]
      };

      service.getByIdentifier('test').subscribe({
        next: (detail: any) => {
          expect(detail.tasks[0].type).toBe('');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/test`).flush(raw);
    });

    it('should delegate to mock service when useMockCitizenFlow is true', fakeAsync(() => {
      environment.useMockCitizenFlow = true;
      let result: any;
      service.getByIdentifier('solicitud-de-licencia').subscribe(r => { result = r; });
      tick(180);
      expect(result.id).toBe('mock-license-application');
    }));
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

    it('should delegate to mock service when useMockCitizenFlow is true', fakeAsync(() => {
      environment.useMockCitizenFlow = true;
      let result: any;
      service.getFormSchema('solicitud-de-licencia').subscribe(r => { result = r; });
      tick(180);
      expect(result.length).toBeGreaterThan(0);
    }));
  });

  describe('getTaskSchema', () => {
    it('should GET task schema for a specific task', (done) => {
      const raw = { id: 't-1', title: 'Data Entry', type: 'form', description: 'Enter data', formFields: [{ id: 'field1', name: 'Field 1', type: 'text' }] };

      service.getTaskSchema('licencia', 't-1').subscribe({
        next: (result) => {
          expect(result.id).toBe('t-1');
          expect(result.type).toBe('form');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/licencia/tasks/t-1/schema`).flush(raw);
    });

    it('should delegate to mock service when useMockCitizenFlow is true', fakeAsync(() => {
      environment.useMockCitizenFlow = true;
      let result: any;
      service.getTaskSchema('solicitud-de-licencia', 'task-0-license').subscribe(r => { result = r; });
      tick(180);
      expect(result.id).toBe('task-0-license');
    }));
  });

  describe('mapFormFields', () => {
    it('should return empty array when formFields is not an array', (done) => {
      const raw = {
        id: 'p-1', title: 'Test', status: 'active',
        tasks: [{ id: 't-1', title: 'Task', type: 'form', description: '', formFields: 'not-array' }]
      };

      service.getByIdentifier('test').subscribe({
        next: (detail: any) => {
          expect(detail.tasks[0].formFields).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/test`).flush(raw);
    });

    it('should fallback to label when name is missing in field', (done) => {
      const raw = {
        id: 'p-1', title: 'Test', status: 'active',
        tasks: [{ id: 't-1', title: 'Task', type: 'form', description: '', formFields: [{ id: 'f1', label: 'Label Name', type: 'text' }] }]
      };

      service.getByIdentifier('test').subscribe({
        next: (detail: any) => {
          expect(detail.tasks[0].formFields[0].name).toBe('Label Name');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/test`).flush(raw);
    });

    it('should fallback to title when name and label are missing in field', (done) => {
      const raw = {
        id: 'p-1', title: 'Test', status: 'active',
        tasks: [{ id: 't-1', title: 'Task', type: 'form', description: '', formFields: [{ id: 'f1', title: 'Title Name', type: 'text' }] }]
      };

      service.getByIdentifier('test').subscribe({
        next: (detail: any) => {
          expect(detail.tasks[0].formFields[0].name).toBe('Title Name');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/test`).flush(raw);
    });

    it('should fallback to id when name, label, and title are missing in field', (done) => {
      const raw = {
        id: 'p-1', title: 'Test', status: 'active',
        tasks: [{ id: 't-1', title: 'Task', type: 'form', description: '', formFields: [{ id: 'f1', type: 'text' }] }]
      };

      service.getByIdentifier('test').subscribe({
        next: (detail: any) => {
          expect(detail.tasks[0].formFields[0].name).toBe('f1');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/test`).flush(raw);
    });

    it('should default field type to text when missing', (done) => {
      const raw = {
        id: 'p-1', title: 'Test', status: 'active',
        tasks: [{ id: 't-1', title: 'Task', type: 'form', description: '', formFields: [{ id: 'f1', name: 'Field' }] }]
      };

      service.getByIdentifier('test').subscribe({
        next: (detail: any) => {
          expect(detail.tasks[0].formFields[0].type).toBe('text');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/test`).flush(raw);
    });

    it('should default required to false when missing', (done) => {
      const raw = {
        id: 'p-1', title: 'Test', status: 'active',
        tasks: [{ id: 't-1', title: 'Task', type: 'form', description: '', formFields: [{ id: 'f1', name: 'Field', type: 'text' }] }]
      };

      service.getByIdentifier('test').subscribe({
        next: (detail: any) => {
          expect(detail.tasks[0].formFields[0].required).toBeFalse();
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/test`).flush(raw);
    });

    it('should default options to empty array when not an array', (done) => {
      const raw = {
        id: 'p-1', title: 'Test', status: 'active',
        tasks: [{ id: 't-1', title: 'Task', type: 'form', description: '', formFields: [{ id: 'f1', name: 'Field', type: 'select', options: 'not-array' }] }]
      };

      service.getByIdentifier('test').subscribe({
        next: (detail: any) => {
          expect(detail.tasks[0].formFields[0].options).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/test`).flush(raw);
    });

    it('should use fields key as fallback for formFields', (done) => {
      const raw = {
        id: 'p-1', title: 'Test', status: 'active',
        tasks: [{ id: 't-1', title: 'Task', type: 'form', description: '', fields: [{ id: 'f1', name: 'From Fields', type: 'text' }] }]
      };

      service.getByIdentifier('test').subscribe({
        next: (detail: any) => {
          expect(detail.tasks[0].formFields.length).toBe(1);
          expect(detail.tasks[0].formFields[0].name).toBe('From Fields');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/test`).flush(raw);
    });
  });

  describe('mapUploadRequirements', () => {
    it('should return empty array when uploadRequirements is not an array', (done) => {
      const raw = {
        id: 'p-1', title: 'Test', status: 'active',
        tasks: [{ id: 't-1', title: 'Upload', type: 'upload', description: '', uploadRequirements: 'not-array' }]
      };

      service.getByIdentifier('test').subscribe({
        next: (detail: any) => {
          expect(detail.tasks[0].uploadRequirements).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/test`).flush(raw);
    });

    it('should fallback to label when name is missing in requirement', (done) => {
      const raw = {
        id: 'p-1', title: 'Test', status: 'active',
        tasks: [{ id: 't-1', title: 'Upload', type: 'upload', description: '', uploadRequirements: [{ id: 'r1', label: 'Label Req', required: true }] }]
      };

      service.getByIdentifier('test').subscribe({
        next: (detail: any) => {
          expect(detail.tasks[0].uploadRequirements[0].name).toBe('Label Req');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/test`).flush(raw);
    });

    it('should fallback to id when name, label, and title are missing in requirement', (done) => {
      const raw = {
        id: 'p-1', title: 'Test', status: 'active',
        tasks: [{ id: 't-1', title: 'Upload', type: 'upload', description: '', uploadRequirements: [{ id: 'r1' }] }]
      };

      service.getByIdentifier('test').subscribe({
        next: (detail: any) => {
          expect(detail.tasks[0].uploadRequirements[0].name).toBe('r1');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog/test`).flush(raw);
    });
  });

  describe('toSlug', () => {
    it('should return empty string for null input', (done) => {
      const raw = [{ id: 'p-1', status: 'active' }];

      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures[0].slug).toBe('');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog`).flush(raw);
    });

    it('should return empty string for undefined title', (done) => {
      const raw = [{ id: 'p-1', title: null, status: 'active' }];

      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures[0].slug).toBe('');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog`).flush(raw);
    });

    it('should handle accented characters in slug generation', (done) => {
      const raw = [{ id: 'p-1', title: 'Certificación Urbana', status: 'active' }];

      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures[0].slug).toBe('certificacion-urbana');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog`).flush(raw);
    });

    it('should collapse multiple dashes into one', (done) => {
      const raw = [{ id: 'p-1', title: 'Test   Multiple   Spaces', status: 'active' }];

      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures[0].slug).toBe('test-multiple-spaces');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog`).flush(raw);
    });

    it('should remove special characters', (done) => {
      const raw = [{ id: 'p-1', title: 'Test!@#$%Procedure', status: 'active' }];

      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures[0].slug).toBe('testprocedure');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog`).flush(raw);
    });
  });
});
