import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseDetailComponent } from './case-detail.component';
import { CaseDetailService } from '../../../application/services/case-detail.service';
import { TranslateModule } from '@ngx-translate/core';

describe('CaseDetailComponent', () => {
  let component: CaseDetailComponent;
  let fixture: ComponentFixture<CaseDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaseDetailComponent],
      imports: [TranslateModule.forRoot()],
      providers: [CaseDetailService]
    }).compileComponents();

    fixture = TestBed.createComponent(CaseDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load case detail', () => {
    expect(component.caseDetail).toBeTruthy();
  });

  it('should return a status class', () => {
    expect(component.statusClass('CASE_STATUS.PENDING')).toContain('amber');
  });
});
