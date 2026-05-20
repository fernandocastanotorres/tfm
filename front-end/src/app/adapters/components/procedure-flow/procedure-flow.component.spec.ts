import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { ProcedureFlowComponent } from './procedure-flow.component';
import { ProceduresApiService } from '../../../application/services/procedures-api.service';
import { ProcedureDetail, ProcedureTaskDto } from '../../../application/models/procedure.models';
import { ToastService } from '../../../application/services/toast.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProcedureFlowComponent', () => {
  let component: ProcedureFlowComponent;
  let fixture: ComponentFixture<ProcedureFlowComponent>;
  let proceduresSpy: jasmine.SpyObj<ProceduresApiService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  const mockTasks: ProcedureTaskDto[] = [
    { id: 'task-1', name: 'Task 1', type: 'form', description: '' },
    { id: 'task-2', name: 'Task 2', type: 'upload', description: '' },
    { id: 'task-3', name: 'Task 3', type: 'review', description: '' }
  ];

  const mockProcedure: ProcedureDetail = {
    id: 'proc-1',
    slug: 'test-procedure',
    name: 'Test Procedure',
    description: 'A test procedure',
    category: 'General',
    fee: 0,
    deadline: 30,
    status: 'active',
    tasks: mockTasks
  };

  function setupComponent(routeParams: { procedureId?: string } = { procedureId: 'test-procedure' }, apiResponse?: { data?: ProcedureDetail; error?: Error }): void {
    proceduresSpy = jasmine.createSpyObj('ProceduresApiService', ['getByIdentifier']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastSpy = jasmine.createSpyObj('ToastService', ['error']);

    if (apiResponse?.error) {
      proceduresSpy.getByIdentifier.and.returnValue(throwError(() => apiResponse.error));
    } else if (apiResponse?.data) {
      proceduresSpy.getByIdentifier.and.returnValue(of(apiResponse.data));
    }

    TestBed.configureTestingModule({
    declarations: [ProcedureFlowComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [TranslateModule.forRoot()],
    providers: [
        { provide: ProceduresApiService, useValue: proceduresSpy },
        { provide: ToastService, useValue: toastSpy },
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    paramMap: {
                        get: (key: string) => routeParams[key as keyof typeof routeParams]
                    }
                }
            }
        },
        { provide: Router, useValue: routerSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});

    fixture = TestBed.createComponent(ProcedureFlowComponent);
    component = fixture.componentInstance;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('Initialization', () => {
    it('should create component', () => {
      setupComponent({ procedureId: 'test-procedure' }, { data: mockProcedure });
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should have loading state initially', () => {
      setupComponent({ procedureId: 'test-procedure' }, { data: mockProcedure });
      // isLoading is true by default before ngOnInit runs
      expect(component.isLoading).toBeTrue();
      fixture.detectChanges();
    });

    it('should redirect to procedures list when no procedureId', () => {
      setupComponent({});
      fixture.detectChanges();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/sede/procedimientos']);
    });

    it('should load procedure when procedureId exists', () => {
      setupComponent({ procedureId: 'test-procedure' }, { data: mockProcedure });
      fixture.detectChanges();
      expect(proceduresSpy.getByIdentifier).toHaveBeenCalledWith('test-procedure');
    });
  });

  describe('Procedure Loading', () => {
    it('should set procedure and tasks on successful load', () => {
      setupComponent({ procedureId: 'test-procedure' }, { data: mockProcedure });
      fixture.detectChanges();

      expect(component.procedure).toEqual(mockProcedure);
      expect(component.tasks).toEqual(mockTasks);
      expect(component.isLoading).toBeFalse();
    });

    it('should set currentTask to first task after loading', () => {
      setupComponent({ procedureId: 'test-procedure' }, { data: mockProcedure });
      fixture.detectChanges();

      expect(component.currentTaskIndex).toBe(0);
      expect(component.currentTask).toEqual(mockTasks[0]);
    });

    it('should show toast error when procedure loading fails', () => {
      setupComponent({ procedureId: 'test-procedure' }, { error: new Error('Network error') });
      fixture.detectChanges();

      expect(toastSpy.error).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
      expect(component.procedure).toBeNull();
    });
  });

  describe('Task Navigation', () => {
    beforeEach(() => {
      setupComponent({ procedureId: 'test-procedure' }, { data: mockProcedure });
      fixture.detectChanges();
    });

    describe('nextTask', () => {
      it('should advance to next task', () => {
        component.nextTask();
        expect(component.currentTaskIndex).toBe(1);
        expect(component.currentTask).toEqual(mockTasks[1]);
      });

      it('should not advance beyond last task', () => {
        component.currentTaskIndex = 2;
        component.nextTask();
        expect(component.currentTaskIndex).toBe(2);
        expect(component.currentTask).toEqual(mockTasks[2]);
      });

      it('should do nothing when procedure is null', () => {
        component.procedure = null;
        component.currentTaskIndex = 0;
        component.nextTask();
        expect(component.currentTaskIndex).toBe(0);
      });
    });

    describe('previousTask', () => {
      it('should go back to previous task', () => {
        component.currentTaskIndex = 2;
        component.previousTask();
        expect(component.currentTaskIndex).toBe(1);
        expect(component.currentTask).toEqual(mockTasks[1]);
      });

      it('should not go before first task', () => {
        component.currentTaskIndex = 0;
        component.previousTask();
        expect(component.currentTaskIndex).toBe(0);
        expect(component.currentTask).toEqual(mockTasks[0]);
      });

      it('should do nothing when procedure is null', () => {
        component.procedure = null;
        component.currentTaskIndex = 1;
        component.previousTask();
        expect(component.currentTaskIndex).toBe(1);
      });
    });
  });

  describe('Step Label', () => {
    it('should return "current / total" format', () => {
      setupComponent({ procedureId: 'test-procedure' }, { data: mockProcedure });
      fixture.detectChanges();

      expect(component.taskStepLabel).toBe('1 / 3');
    });

    it('should return empty string when no procedure', () => {
      component.procedure = null;
      expect(component.taskStepLabel).toBe('');
    });

    it('should update when currentTaskIndex changes', () => {
      setupComponent({ procedureId: 'test-procedure' }, { data: mockProcedure });
      fixture.detectChanges();

      component.currentTaskIndex = 2;
      expect(component.taskStepLabel).toBe('3 / 3');
    });
  });

  describe('Task Type Hints', () => {
    beforeEach(() => {
      setupComponent({ procedureId: 'test-procedure' }, { data: mockProcedure });
      fixture.detectChanges();
    });

    it('should return HINT_FORM for form type', () => {
      expect(component.getTaskTypeHint('form')).toBe('PROCEDURE_FLOW.HINT_FORM');
    });

    it('should return HINT_UPLOAD for upload type', () => {
      expect(component.getTaskTypeHint('upload')).toBe('PROCEDURE_FLOW.HINT_UPLOAD');
    });

    it('should return HINT_REVIEW for review type', () => {
      expect(component.getTaskTypeHint('review')).toBe('PROCEDURE_FLOW.HINT_REVIEW');
    });

    it('should return empty string for unknown type', () => {
      expect(component.getTaskTypeHint('unknown')).toBe('');
    });
  });
});
