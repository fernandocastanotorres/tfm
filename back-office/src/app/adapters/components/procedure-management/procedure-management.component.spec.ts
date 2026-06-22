import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProcedureManagementComponent } from './procedure-management.component';
import { ProcedureManagementService } from '../../../application/services/procedure-management.service';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';
import { ToastService } from '../../../application/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

describe('ProcedureManagementComponent', () => {
  let component: ProcedureManagementComponent;
  let fixture: ComponentFixture<ProcedureManagementComponent>;
  let mockService: jasmine.SpyObj<ProcedureManagementService>;
  let mockConfirmDialog: jasmine.SpyObj<ConfirmDialogService>;
  let mockToast: jasmine.SpyObj<ToastService>;
  let mockTranslate: jasmine.SpyObj<TranslateService>;

  const mockCategories = ['Urbanismo', 'Padrón', 'Administración'];
  const mockUnits = ['Secretaría', 'Tesorería', 'Registro'];

  const mockProcedures = [
    {
      id: 'proc-1',
      title: 'Licencia de Obra',
      description: 'Descripción',
      category: 'Urbanismo',
      status: 'DRAFT' as const,
      assignedUnit: 'Urbanismo',
      deadlineDays: 30,
      feeAmount: 100,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      tasks: [
        {
          id: 'task-1',
          title: 'Datos solicitante',
          type: 'FORM' as const,
          description: 'Completa datos',
          orderIndex: 0,
          assignedRole: 'ROLE_TRAMITADOR' as const,
          fields: [
            { id: 'f1', label: 'Nombre', type: 'text' as const, required: true, options: [] }
          ]
        },
        {
          id: 'task-2',
          title: 'Documentación',
          type: 'UPLOAD' as const,
          description: 'Sube documentos',
          orderIndex: 1,
          assignedRole: 'ROLE_TRAMITADOR' as const,
          fields: []
        }
      ],
      formSchema: []
    }
  ];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ProcedureManagementService', [
      'list', 'listCategories', 'listUnits', 'create', 'update',
      'toggleStatus', 'listTranslations', 'upsertTranslation',
      'listTaskTranslations', 'upsertTaskTranslation'
    ]);
    mockService.list.and.returnValue(of(mockProcedures));
    mockService.listCategories.and.returnValue(of(mockCategories));
    mockService.listUnits.and.returnValue(of(mockUnits));
    mockService.create.and.returnValue(of(mockProcedures[0]));
    mockService.update.and.returnValue(of(mockProcedures[0]));
    mockService.listTranslations.and.returnValue(of([]));
    mockService.upsertTranslation.and.returnValue(of({} as any));
    mockService.listTaskTranslations.and.returnValue(of([]));
    mockService.upsertTaskTranslation.and.returnValue(of({} as any));

    mockConfirmDialog = jasmine.createSpyObj('ConfirmDialogService', ['confirm']);
    mockConfirmDialog.confirm.and.returnValue(Promise.resolve(true));

    mockToast = jasmine.createSpyObj('ToastService', ['success', 'error']);

    mockTranslate = jasmine.createSpyObj('TranslateService', ['instant']);
    mockTranslate.instant.and.returnValue('mock translation');

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ProcedureManagementComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ProcedureManagementService, useValue: mockService },
        { provide: ConfirmDialogService, useValue: mockConfirmDialog },
        { provide: ToastService, useValue: mockToast },
        { provide: TranslateService, useValue: mockTranslate }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProcedureManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories and units on init', (done) => {
    component.ngOnInit();

    setTimeout(() => {
      expect(component.categories).toEqual(mockCategories);
      expect(component.units).toEqual(mockUnits);
      done();
    }, 100);
  });

  it('should load procedures on init', () => {
    expect(component.procedures).toEqual(mockProcedures);
    expect(mockService.list).toHaveBeenCalled();
  });

  it('should create empty form with fields: [] for new task', () => {
    component.openCreate();
    component.addTask();

    const newTask = component.form.tasks[0];
    expect(newTask.type).toBe('REVIEW');
    expect(newTask.fields).toEqual([]);
  });

  it('should add field to specific task', () => {
    component.openCreate();
    component.addTask();
    component.addTask();

    component.addFieldToTask(0);

    expect(component.form.tasks[0].fields).toHaveSize(1);
    expect(component.form.tasks[1].fields).toHaveSize(0);
  });

  it('should remove field from specific task', async () => {
    component.openCreate();
    component.addTask();
    component.addFieldToTask(0);

    const fieldId = component.form.tasks[0].fields![0].id;
    component.removeFieldFromTask(0, fieldId);

    await fixture.whenStable();
    expect(component.form.tasks[0].fields).toHaveSize(0);
  });

  it('should set activeTaskIndex when adding field', () => {
    component.openCreate();

    expect(component.activeTaskIndex).toBeNull();
    component.addTask();
    expect(component.activeTaskIndex).toBe(0);

    component.selectTask(0);
    expect(component.activeTaskIndex).toBeNull();
  });

  it('should toggle task expansion via selectTask', () => {
    component.openCreate();
    component.addTask();

    expect(component.activeTaskIndex).toBe(0);
    component.selectTask(0);
    expect(component.activeTaskIndex).toBeNull();

    component.selectTask(0);
    expect(component.activeTaskIndex).toBe(0);
  });

  it('should openEdit load tasks with fields from procedure', () => {
    component.openEdit(mockProcedures[0]);

    expect(component.form.tasks).toHaveSize(2);
    expect(component.form.tasks[0].fields).toHaveSize(1);
    expect(component.form.tasks[0].fields![0].id).toBe('f1');
    expect(component.form.tasks[1].fields).toEqual([]);
  });

  it('should send tasks with fields when saving', (done) => {
    component.openCreate();
    component.form.title = 'New Procedure';
    component.form.category = 'Urbanismo';
    component.form.assignedUnit = 'Urbanismo';
    component.addTask();
    component.addFieldToTask(0);

    component.save();

    setTimeout(() => {
      const createCall = mockService.create.calls.mostRecent();
      const savedProcedure = createCall.args[0];
      expect(savedProcedure.tasks).toHaveSize(1);
      expect(savedProcedure.tasks[0].fields).toHaveSize(1);
      done();
    }, 100);
  });

  it('should filter procedures by search term', () => {
    component.searchTerm = 'Licencia';
    expect(component.filteredProcedures).toHaveSize(1);
    expect(component.filteredProcedures[0].title).toBe('Licencia de Obra');

    component.searchTerm = 'inexistente';
    expect(component.filteredProcedures).toHaveSize(0);
  });

  it('should not save if title is empty', async () => {
    component.openCreate();
    component.form.title = '';
    component.form.assignedUnit = 'Urbanismo';

    await component.save();

    expect(mockService.create).not.toHaveBeenCalled();
  });

  it('should not save if assignedUnit is empty', async () => {
    component.openCreate();
    component.form.title = 'Test';
    component.form.assignedUnit = '';

    await component.save();

    expect(mockService.create).not.toHaveBeenCalled();
  });
});