import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CaseDetailComponent } from './case-detail.component';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

describe('CaseDetailComponent', () => {
  let component: CaseDetailComponent;
  let fixture: ComponentFixture<CaseDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaseDetailComponent],
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'test-case-id'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CaseDetailComponent);
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
