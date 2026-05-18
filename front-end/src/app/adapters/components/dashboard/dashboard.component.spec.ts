import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../../application/services/dashboard.service';
import { environment } from '../../../../environments/environment';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;

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
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule, TranslateModule.forRoot(), RouterTestingModule],
      providers: [DashboardService]
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
});
