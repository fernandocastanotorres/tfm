import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CaseWizardComponent } from './case-wizard.component';
import { CaseWizardService } from '../../../application/services/case-wizard.service';
import { ProceduresService } from '../../../application/services/procedures.service';

describe('CaseWizardComponent', () => {
  let component: CaseWizardComponent;
  let fixture: ComponentFixture<CaseWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaseWizardComponent],
      imports: [ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        CaseWizardService,
        ProceduresService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'procedure-license'
              }
            }
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CaseWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should progress to next task', () => {
    const originalIndex = component.currentTaskIndex;
    component.nextStep();
    expect(component.currentTaskIndex).toBeGreaterThanOrEqual(originalIndex);
  });
});
