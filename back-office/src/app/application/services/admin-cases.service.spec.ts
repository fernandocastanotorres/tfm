import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AdminCasesService } from './admin-cases.service';
import { environment } from '../../../environments/environment';

describe('AdminCasesService', () => {
  let service: AdminCasesService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiBaseUrl}/admin`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminCasesService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AdminCasesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list cases via GET with default pagination', () => {
    const mockResponse = { items: [], page: 0, size: 10, totalItems: 0, totalPages: 0 };

    service.list().subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/procedures?page=0&size=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should list cases with sort and status filters', () => {
    const mockResponse = { items: [], page: 0, size: 5, totalItems: 0, totalPages: 0 };

    service.list(0, 5, 'createdAt,desc', 'IN_PROGRESS').subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/procedures?page=0&size=5&sort=createdAt,desc&status=IN_PROGRESS`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get case detail via GET with mapped response', () => {
    const rawResponse = { id: 'case-1', title: 'Test', status: 'OPEN', entryNumber: null, timeline: [], attachments: [] };

    service.getDetail('case-1').subscribe((detail) => {
      expect(detail.id).toBe('case-1');
      expect(detail.entryNumber).toBeNull();
      expect(detail.timeline).toEqual([]);
      expect(detail.attachments).toEqual([]);
    });

    const req = httpMock.expectOne(`${baseUrl}/procedures/case-1`);
    expect(req.request.method).toBe('GET');
    req.flush(rawResponse);
  });

  it('should get case detail with timeline and attachments mapping', () => {
    const rawResponse = {
      id: 'case-2', title: 'Test 2', status: 'OPEN',
      entryNumber: 'ENT-001',
      timeline: [{ id: 't1', title: 'Created', date: '2024-01-01', description: 'Case created' }],
      attachments: [{ id: 'a1', name: 'file.pdf', type: 'application/pdf', size: 1024, uploadedAt: '2024-01-01' }]
    };

    service.getDetail('case-2').subscribe((detail) => {
      expect(detail.entryNumber).toBe('ENT-001');
      expect(detail.timeline[0].actor).toBe('Sistema');
      expect(detail.attachments[0].signed).toBeFalse();
    });

    const req = httpMock.expectOne(`${baseUrl}/procedures/case-2`);
    req.flush(rawResponse);
  });

  it('should update case status via PATCH', () => {
    const mockResponse = { id: 'case-1', status: 'RESOLVED', statusUpdatedAt: '2024-06-01' };

    service.updateStatus('case-1', 'RESOLVED').subscribe((res) => {
      expect(res.status).toBe('RESOLVED');
      expect(res.currentTask).toBe('');
    });

    const req = httpMock.expectOne(`${baseUrl}/procedures/case-1/status?status=RESOLVED`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse);
  });

  it('should reassign case via PATCH', () => {
    const mockResponse = { id: 'case-1', status: 'ASSIGNED', statusUpdatedAt: '2024-06-01' };

    service.reassignCase('case-1', 'user-2').subscribe((res) => {
      expect(res.status).toBe('ASSIGNED');
    });

    const req = httpMock.expectOne(`${baseUrl}/procedures/case-1/reassign?assigneeId=user-2`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse);
  });

  it('should get pending tasks via GET', () => {
    const mockTasks = [{ id: 't1', caseId: 'case-1', title: 'Review', description: '...', assignedTo: 'user-1', createdAt: '2024-01-01', dueDate: '2024-02-01' }] as any[];

    service.getPendingTasks().subscribe((tasks) => {
      expect(tasks).toEqual(mockTasks as any);
    });

    const req = httpMock.expectOne(`${baseUrl}/tasks/pending`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });

  it('should get pending tasks filtered by case via GET', () => {
    const mockTasks = [
      { id: 't1', caseId: 'case-1', title: 'Review', description: '...', assignedTo: 'user-1', createdAt: '2024-01-01', dueDate: '2024-02-01' },
      { id: 't2', caseId: 'case-2', title: 'Approve', description: '...', assignedTo: 'user-2', createdAt: '2024-01-01', dueDate: '2024-02-01' }
    ] as any[];

    service.getPendingTasksByCase('case-1').subscribe((tasks) => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].caseId).toBe('case-1');
    });

    const req = httpMock.expectOne(`${baseUrl}/tasks/pending`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });

  it('should resolve task via POST', () => {
    const request = { resolution: 'Approved', comment: 'Looks good' } as any;
    const mockResponse = { id: 'case-1', status: 'IN_PROGRESS', statusUpdatedAt: '2024-06-01' };

    service.resolveTask('case-1', 'task-1', request).subscribe((res) => {
      expect(res.status).toBe('IN_PROGRESS');
    });

    const req = httpMock.expectOne(`${baseUrl}/procedures/case-1/tasks/task-1/resolve`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockResponse);
  });

  it('should get dashboard stats via GET', () => {
    const mockStats = { totalCases: 100, pendingCases: 20, resolvedCases: 80 } as any;

    service.getDashboardStats().subscribe((stats) => {
      expect(stats.totalCases).toBe(100);
    });

    const req = httpMock.expectOne(`${baseUrl}/dashboard/stats`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });

  it('should get dashboard report via GET with optional date filters', () => {
    const mockReport = { byStatus: [], byProcedureType: [], dailyTrend: [] } as any;

    service.getDashboardReport('2024-01-01', '2024-06-30').subscribe((report) => {
      expect(report).toEqual(mockReport);
    });

    const req = httpMock.expectOne(`${baseUrl}/dashboard/report?from=2024-01-01&to=2024-06-30`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReport);
  });

  it('should download document via GET with blob response', () => {
    const mockBlob = new Blob(['doc-content'], { type: 'application/pdf' });

    service.downloadDocument('doc-1').subscribe((blob) => {
      expect(blob).toEqual(mockBlob);
    });

    const req = httpMock.expectOne(`${baseUrl}/procedures/documents/doc-1/download`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });

  it('should get workflow graph via GET', () => {
    const mockGraph = { nodes: [], edges: [] } as any;

    service.getWorkflowGraph('case-1').subscribe((graph) => {
      expect(graph.nodes).toEqual([]);
    });

    const req = httpMock.expectOne(`${baseUrl}/procedures/case-1/workflow-graph`);
    expect(req.request.method).toBe('GET');
    req.flush(mockGraph);
  });
});
