import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError, Subject } from 'rxjs';
import { CaseSearchComponent } from './case-search.component';
import { CasesApiService } from '../../../application/services/cases-api.service';
import { I18nService, SupportedLocale } from '../../../application/services/i18n.service';
import { ToastService } from '../../../application/services/toast.service';
import { PagedResponse } from '../../../application/models/case.models';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('CaseSearchComponent', () => {
  let component: CaseSearchComponent;
  let fixture: ComponentFixture<CaseSearchComponent>;
  let casesSpy: jasmine.SpyObj<CasesApiService>;
  let i18nSpy: jasmine.SpyObj<I18nService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let localeSubject: Subject<SupportedLocale>;

  const mockCases = [
    { id: 'case-1', title: 'License Application', status: 'PENDING', procedureType: 'License', createdAt: '2024-01-01', lastUpdated: '2024-01-01', description: '', assignedUnit: '' },
    { id: 'case-2', title: 'Permit Request', status: 'COMPLETED', procedureType: 'Permit', createdAt: '2024-02-01', lastUpdated: '2024-02-01', description: '', assignedUnit: '' },
    { id: 'case-3', title: 'Registration', status: 'WAITING', procedureType: 'Registration', createdAt: '2024-03-01', lastUpdated: '2024-03-01', description: '', assignedUnit: '' }
  ];

  const mockPagedResponse: PagedResponse<typeof mockCases[0]> = {
    items: mockCases,
    page: 0,
    size: 100,
    totalItems: 3,
    totalPages: 1
  };

  beforeEach(() => {
    localeSubject = new Subject<SupportedLocale>();
    casesSpy = jasmine.createSpyObj('CasesApiService', ['list']);
    i18nSpy = jasmine.createSpyObj('I18nService', ['getCurrentLocale$']);
    toastSpy = jasmine.createSpyObj('ToastService', ['error', 'success', 'warning']);
    i18nSpy.getCurrentLocale$.and.returnValue(localeSubject.asObservable());

    TestBed.configureTestingModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [ReactiveFormsModule, TranslateModule.forRoot(), CaseSearchComponent],
    providers: [
        { provide: CasesApiService, useValue: casesSpy },
        { provide: I18nService, useValue: i18nSpy },
        { provide: ToastService, useValue: toastSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideRouter([])
    ]
});

    fixture = TestBed.createComponent(CaseSearchComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should have loading state initially', () => {
      expect(component.isLoading).toBeTrue();
    });

    it('should load cases on init', () => {
      casesSpy.list.and.returnValue(of(mockPagedResponse));

      component.ngOnInit();

      expect(casesSpy.list).toHaveBeenCalledWith(0, 100);
    });
  });

  describe('Case Loading', () => {
    it('should set cases on successful load', () => {
      casesSpy.list.and.returnValue(of(mockPagedResponse));

      component.ngOnInit();

      expect(component.cases).toEqual(mockCases);
      expect(component.isLoading).toBeFalse();
    });

    it('should show toast error when loading fails', () => {
      casesSpy.list.and.returnValue(throwError(() => new Error('Network error')));

      component.ngOnInit();

      expect(toastSpy.error).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
      expect(component.cases).toEqual([]);
    });
  });

  describe('Locale Reload', () => {
    it('should reload cases when locale changes', () => {
      casesSpy.list.and.returnValue(of(mockPagedResponse));
      component.ngOnInit();

      casesSpy.list.calls.reset();
      localeSubject.next('ca-ES');

      expect(casesSpy.list).toHaveBeenCalledWith(0, 100);
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      component.cases = mockCases;
    });

    it('filteredCases should return all cases when no search term', () => {
      component.searchForm.patchValue({ term: '' });

      expect(component.filteredCases).toEqual(mockCases);
    });

    it('filteredCases should filter by id', () => {
      component.searchForm.patchValue({ term: 'case-2' });

      const result = component.filteredCases;

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('case-2');
    });

    it('filteredCases should filter by title', () => {
      component.searchForm.patchValue({ term: 'License' });

      const result = component.filteredCases;

      expect(result.length).toBe(1);
      expect(result[0].title).toBe('License Application');
    });

    it('filteredCases should filter by status', () => {
      component.searchForm.patchValue({ term: 'COMPLETED' });

      const result = component.filteredCases;

      expect(result.length).toBe(1);
      expect(result[0].status).toBe('COMPLETED');
    });

    it('filteredCases should filter by procedureType', () => {
      component.searchForm.patchValue({ term: 'Registration' });

      const result = component.filteredCases;

      expect(result.length).toBe(1);
      expect(result[0].procedureType).toBe('Registration');
    });

    it('filteredCases should be case-insensitive', () => {
      component.searchForm.patchValue({ term: 'license' });

      const result = component.filteredCases;

      expect(result.length).toBe(1);
      expect(result[0].title).toBe('License Application');
    });
  });

  describe('Cleanup', () => {
    it('ngOnDestroy should unsubscribe from locale', () => {
      casesSpy.list.and.returnValue(of(mockPagedResponse));
      component.ngOnInit();

      component.ngOnDestroy();

      localeSubject.next('eu-ES');

      expect(casesSpy.list).toHaveBeenCalledTimes(1);
    });

    it('ngOnDestroy should do nothing when localeSubscription is null', () => {
      component.ngOnDestroy();
      expect(component).toBeTruthy();
    });
  });

  describe('toCaseStatusKey', () => {
    it('should normalize status string', () => {
      expect(component.toCaseStatusKey('under review')).toBe('UNDER_REVIEW');
    });

    it('should handle empty/null status', () => {
      expect(component.toCaseStatusKey('')).toBe('');
    });
  });

  describe('Filtering edge cases', () => {
    beforeEach(() => {
      component.cases = mockCases;
    });

    it('filteredCases should return empty when no match', () => {
      component.searchForm.patchValue({ term: 'zzzzz' });
      expect(component.filteredCases).toEqual([]);
    });

    it('filteredCases should be case-insensitive', () => {
      component.searchForm.patchValue({ term: 'LICENSE' });
      const result = component.filteredCases;
      expect(result.length).toBe(1);
      expect(result[0].procedureType).toBe('License');
    });
  });
});
