import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../../application/services/dashboard.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [ReactiveFormsModule, TranslateModule.forRoot(), RouterTestingModule],
      providers: [DashboardService]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load cases', () => {
    expect(component.cases.length).toBeGreaterThan(0);
  });

  it('should filter cases by status', () => {
    component.filterForm.patchValue({ status: 'CASE_STATUS.REVIEW' });
    expect(component.filteredCases.every((c) => c.status === 'REVIEW')).toBeTrue();
  });

  it('should load mock data', () => {
    expect(component.cases.length).toBeGreaterThan(0);
    expect(component.notifications.length).toBeGreaterThan(0);
    expect(component.quickAccess.length).toBeGreaterThan(0);
  });
});
