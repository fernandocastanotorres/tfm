import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProceduresApiService } from './procedures-api.service';
import { MockCitizenFlowService } from './mock-citizen-flow.service';
import { environment } from '../../../environments/environment';

describe('ProceduresApiService', () => {
  let service: ProceduresApiService;
  let httpMock: HttpTestingController;

  const mockProcedureRaw = {
    id: 'proc-1',
    slug: 'test-procedure',
    title: 'Test Procedure',
    description: 'A test procedure',
    unit: 'Urbanismo',
    feeAmount: 100,
    deadlineDays: 30,
    status: 'AVAILABLE'
  };

  const mockProcedureDetailRaw = {
    ...mockProcedureRaw,
    tasks: [
      {
        id: 'task-1',
        title: 'Data Entry',
        type: 'form',
        description: 'Enter your data',
        formFields: [
          { id: 'name', name: 'Name', type: 'text', required: true }
        ]
      }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProceduresApiService, MockCitizenFlowService]
    });
    service = TestBed.inject(ProceduresApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listAll', () => {
    it('should GET /citizen/procedures/catalog', (done) => {
      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures.length).toBe(1);
          expect(procedures[0].id).toBe('proc-1');
          expect(procedures[0].name).toBe('Test Procedure');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/catalog`);
      expect(req.request.method).toBe('GET');
      req.flush([mockProcedureRaw]);
    });

    it('should map procedure items correctly', (done) => {
      const raw = {
        id: 'p-1',
        title: 'My Procedure',
        description: 'Description here',
        unit: 'Registry',
        feeAmount: 50,
        deadlineDays: 15,
        status: 'AVAILABLE'
      };

      service.listAll().subscribe({
        next: (procedures) => {
          const item = procedures[0];
          expect(item.id).toBe('p-1');
          expect(item.slug).toBe('my-procedure');
          expect(item.name).toBe('My Procedure');
          expect(item.category).toBe('Registry');
          expect(item.fee).toBe(50);
          expect(item.deadline).toBe(15);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/catalog`
      ).flush([raw]);
    });

    it('should generate slug from title when missing', (done) => {
      const raw = {
        id: 'p-2',
        title: 'Licencia de Obra Menor',
        status: 'AVAILABLE'
      };

      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures[0].slug).toBe('licencia-de-obra-menor');
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/catalog`
      ).flush([raw]);
    });

    it('should return empty array when no procedures', (done) => {
      service.listAll().subscribe({
        next: (procedures) => {
          expect(procedures).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/catalog`
      ).flush([]);
    });
  });

  describe('getByIdentifier', () => {
    it('should GET /citizen/procedures/catalog/{identifier}', (done) => {
      service.getByIdentifier('test-procedure').subscribe({
        next: (detail) => {
          expect(detail.id).toBe('proc-1');
          expect(detail.tasks.length).toBe(1);
          done();
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/catalog/test-procedure`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockProcedureDetailRaw);
    });

    it('should map tasks with form fields', (done) => {
      service.getByIdentifier('proc-1').subscribe({
        next: (detail) => {
          const task = detail.tasks[0];
          expect(task.id).toBe('task-1');
          expect(task.name).toBe('Data Entry');
          expect(task.type).toBe('form');
          expect(task.formFields!.length).toBe(1);
          expect(task.formFields![0].id).toBe('name');
          expect(task.formFields![0].required).toBeTrue();
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/catalog/proc-1`
      ).flush(mockProcedureDetailRaw);
    });

    it('should map form field defaults correctly', (done) => {
      const raw = {
        id: 'proc-1',
        title: 'Test',
        status: 'AVAILABLE',
        tasks: [{
          id: 'task-1',
          title: 'Task',
          type: 'form',
          formFields: [
            { id: 'f1' },
            { id: 'f2', label: 'Label', type: 'email', required: false, options: ['a', 'b'] }
          ]
        }]
      };

      service.getByIdentifier('proc-1').subscribe({
        next: (detail) => {
          const fields = detail.tasks[0].formFields!;
          expect(fields[0].name).toBe('f1');
          expect(fields[0].placeholder).toBe('Introduce f1');
          expect(fields[0].required).toBeFalse();
          expect(fields[1].name).toBe('Label');
          expect(fields[1].type).toBe('email');
          expect(fields[1].options).toEqual([
            { value: 'a', label: 'a' },
            { value: 'b', label: 'b' }
          ]);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/catalog/proc-1`
      ).flush(raw);
    });

    it('should map upload requirements', (done) => {
      const raw = {
        id: 'proc-1',
        title: 'Test',
        status: 'AVAILABLE',
        tasks: [{
          id: 'task-1',
          title: 'Upload Task',
          type: 'upload',
          uploadRequirements: [
            { id: 'req-1', name: 'ID Document', required: true },
            { id: 'req-2', label: 'Supporting Doc', required: false }
          ]
        }]
      };

      service.getByIdentifier('proc-1').subscribe({
        next: (detail) => {
          const reqs = detail.tasks[0].uploadRequirements!;
          expect(reqs.length).toBe(2);
          expect(reqs[0].name).toBe('ID Document');
          expect(reqs[0].required).toBeTrue();
          expect(reqs[1].name).toBe('Supporting Doc');
          expect(reqs[1].required).toBeFalse();
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/catalog/proc-1`
      ).flush(raw);
    });

    it('should handle missing tasks array', (done) => {
      const raw = { id: 'proc-1', title: 'Test', status: 'AVAILABLE' };

      service.getByIdentifier('proc-1').subscribe({
        next: (detail) => {
          expect(detail.tasks).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/catalog/proc-1`
      ).flush(raw);
    });
  });

  describe('getFormSchema', () => {
    it('should GET /citizen/procedures/catalog/{slug}/form-schema', (done) => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', type: 'form', formFields: [] }
      ];

      service.getFormSchema('test-procedure').subscribe({
        next: (result) => {
          expect(result.length).toBe(1);
          expect(result[0].id).toBe('task-1');
          done();
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/catalog/test-procedure/form-schema`
      );
      expect(req.request.method).toBe('GET');
      req.flush(tasks);
    });

    it('should return empty array when no tasks', (done) => {
      service.getFormSchema('test-procedure').subscribe({
        next: (result) => {
          expect(result).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/catalog/test-procedure/form-schema`
      ).flush([]);
    });
  });

  describe('getTaskSchema', () => {
    it('should GET /citizen/procedures/catalog/{slug}/tasks/{taskId}/schema', (done) => {
      const task = {
        id: 'task-1',
        title: 'Data Entry',
        type: 'form',
        description: 'Enter data',
        formFields: [{ id: 'f1', name: 'Field 1', type: 'text', required: true }]
      };

      service.getTaskSchema('test-procedure', 'task-1').subscribe({
        next: (result) => {
          expect(result.id).toBe('task-1');
          expect(result.type).toBe('form');
          done();
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/catalog/test-procedure/tasks/task-1/schema`
      );
      expect(req.request.method).toBe('GET');
      req.flush(task);
    });
  });

  describe('error handling', () => {
    it('should propagate HTTP errors from listAll', (done) => {
      service.listAll().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/catalog`
      ).flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });

    it('should propagate HTTP errors from getByIdentifier', (done) => {
      service.getByIdentifier('nonexistent').subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/catalog/nonexistent`
      ).flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    });
  });
});
