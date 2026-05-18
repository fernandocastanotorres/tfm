import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CaseWizardComponent } from './case-wizard.component';

describe('CaseWizardComponent', () => {
  let component: CaseWizardComponent;
  let fixture: ComponentFixture<CaseWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaseWizardComponent],
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'procedure-license'
              },
              queryParamMap: {
                get: () => null
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have loading state initially', () => {
    expect(component.isLoading).toBeTrue();
  });
});
