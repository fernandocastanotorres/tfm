import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../../application/services/dashboard.service';
import { ToastService } from '../../../application/services/toast.service';
import { environment } from '../../../../environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;
  let toastSpy: jasmine.SpyObj<ToastService>;

  const mockPagedResponse = {
    items: [
      { id: '1', procedureType: 'License', status: 'REVIEW', createdAt: '2026-05-01', lastUpdated: '2026-05-14', title: 'Test Case 1', description: 'Desc', assignedUnit: 'Unit' },
      { id: '2', procedureType: 'Certificate', status: 'PENDING', createdAt: '2026-05-05', lastUpdated: '2026-05-10', title: 'Test Case 2', description: 'Desc', assignedUnit: 'Unit' },
      { id: '3', procedureType: 'License', status: 'APPROVED', createdAt: '2026-04-29', lastUpdated: '2026-05-08', title: 'Test Case 3', description: 'Desc', assignedUnit: 'Unit' }
    ],
    page: 0,
    size: 10,
    totalItems: 3,
    totalPages: 1
  };

  beforeEach(async () => {
    toastSpy = jasmine.createSpyObj('ToastService', ['error', 'success', 'warning']);

    await TestBed.configureTestingModule({
    declarations: [DashboardComponent],
    imports: [ReactiveFormsModule, TranslateModule.forRoot(), RouterTestingModule],
    providers: [
      DashboardService,
      { provide: ToastService, useValue: toastSpy },
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting()
    ]
}).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load cases', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req.flush(mockPagedResponse);
    tick();

    expect(component.cases.length).toBe(3);
    expect(component.isLoading).toBeFalse();
  }));

  it('should filter cases by status', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req.flush(mockPagedResponse);
    tick();

    component.filterForm.patchValue({ status: 'REVIEW' });
    expect(component.filteredCases.every((c) => c.status === 'REVIEW')).toBeTrue();
  }));

  it('should load mock data', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req.flush(mockPagedResponse);
    tick();

    expect(component.cases.length).toBe(3);
    expect(component.notifications.length).toBeGreaterThan(0);
    expect(component.quickAccess.length).toBeGreaterThan(0);
  }));

  it('should show toast error when API returns err.error.message', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req.flush({ message: 'Custom API error' }, { status: 500, statusText: 'Server Error' });
    tick();
    expect(toastSpy.error).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle empty case list from API', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req.flush({ items: [], page: 0, size: 10, totalItems: 0, totalPages: 0 });
    tick();
    expect(component.cases.length).toBe(0);
    expect(component.selectedCase).toBeNull();
    expect(component.isLoading).toBeFalse();
  }));

  it('should filter cases by search text matching title', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req.flush(mockPagedResponse);
    tick();
    component.filterForm.patchValue({ search: 'Test Case 1' });
    expect(component.filteredCases.length).toBe(1);
    expect(component.filteredCases[0].title).toBe('Test Case 1');
  }));

  it('should filter cases by search text matching id', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req.flush(mockPagedResponse);
    tick();
    component.filterForm.patchValue({ search: '2' });
    expect(component.filteredCases.length).toBe(1);
    expect(component.filteredCases[0].id).toBe('2');
  }));

  it('should filter cases by search text matching procedureType', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req.flush(mockPagedResponse);
    tick();
    component.filterForm.patchValue({ search: 'certificate' });
    expect(component.filteredCases.length).toBe(1);
    expect(component.filteredCases[0].procedureType).toBe('Certificate');
  }));

  it('should return blue status class for REVIEW status', () => {
    expect(component.statusClass('REVIEW')).toBe('bg-blue-100 text-blue-700');
  });

  it('should return green status class for COMPLETED status', () => {
    expect(component.statusClass('COMPLETED')).toBe('bg-green-100 text-green-700');
  });

  it('should return amber status class for WAITING status', () => {
    expect(component.statusClass('WAITING')).toBe('bg-amber-100 text-amber-700');
  });

  it('should reject changePage with page less than 1', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req.flush(mockPagedResponse);
    tick();
    const beforePage = component.paginationState.currentPage;
    component.changePage(0);
    expect(component.paginationState.currentPage).toBe(beforePage);
  }));

  it('should reject changePage with page greater than totalPages', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req.flush(mockPagedResponse);
    tick();
    const beforePage = component.paginationState.currentPage;
    component.changePage(999);
    expect(component.paginationState.currentPage).toBe(beforePage);
  }));

  it('should accept changePage with valid page number', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req.flush(mockPagedResponse);
    tick();
    component.changePage(1);
    // changePage(1) triggers loadCases() with page=0 (1-1), size=10
    const req2 = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req2.flush(mockPagedResponse);
    tick();
    expect(component.paginationState.currentPage).toBe(1);
  }));

  it('should update page size to 20 and reset to page 1', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req.flush(mockPagedResponse);
    tick();
    component.updatePageSize(20);
    // updatePageSize triggers loadCases() with page=0, size=20
    const req2 = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=20`);
    req2.flush(mockPagedResponse);
    tick();
    expect(component.paginationState.pageSize).toBe(20);
    expect(component.paginationState.currentPage).toBe(1);
  }));

  it('should clear filters and reload cases', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req.flush(mockPagedResponse);
    tick();
    component.filterForm.patchValue({ search: 'test', status: 'REVIEW' });
    component.clearFilters();
    // clearFilters triggers loadCases() with page=0, size=10
    const req2 = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req2.flush(mockPagedResponse);
    tick();
    expect(component.filterForm.value.search).toBe('');
    expect(component.filterForm.value.status).toBe('all');
  }));

  it('selectCase should set selectedCase', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req.flush(mockPagedResponse);
    tick();
    const caseItem = component.cases[0];
    component.selectCase(caseItem);
    expect(component.selectedCase).toBe(caseItem);
  }));

  it('summaryStats should compute correct counts', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req.flush(mockPagedResponse);
    tick();
    const stats = component.summaryStats;
    expect(stats.length).toBe(4);
    expect(stats[0].value).toBe(3); // total
  }));

  it('loadCases should set isLoading to false on error without message', fakeAsync(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
    req.flush(null, { status: 500, statusText: 'Server Error' });
    tick();
    expect(component.isLoading).toBeFalse();
  }));

  it('toCaseStatusKey should normalize status', () => {
    expect(component.toCaseStatusKey('under review')).toBe('UNDER_REVIEW');
  });

  it('toCaseStatusKey should handle empty status', () => {
    expect(component.toCaseStatusKey('')).toBe('');
  });
});
