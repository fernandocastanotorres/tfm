import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { InstitutionalInfoComponent } from './institutional-info.component';
import { InstitutionalService } from '../../../application/services/institutional.service';
import { I18nService } from '../../../application/services/i18n.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('InstitutionalInfoComponent', () => {
  let component: InstitutionalInfoComponent;
  let fixture: ComponentFixture<InstitutionalInfoComponent>;
  let institutionalService: jasmine.SpyObj<InstitutionalService>;

  const mockSections = [
    { id: '1', title: 'Government Structure', content: 'Content 1', order: 1 },
    { id: '2', title: 'Legal Framework', content: 'Content 2', order: 2 }
  ];

  beforeEach(async () => {
    institutionalService = jasmine.createSpyObj('InstitutionalService', ['getAllSections']);
    institutionalService.getAllSections.and.returnValue(of(mockSections));

    await TestBed.configureTestingModule({
    declarations: [InstitutionalInfoComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [TranslateModule.forRoot(), RouterTestingModule],
    providers: [
        { provide: InstitutionalService, useValue: institutionalService },
        I18nService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(InstitutionalInfoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load sections on init', () => {
    fixture.detectChanges();
    expect(institutionalService.getAllSections).toHaveBeenCalled();
    expect(component.sections.length).toBe(2);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle empty sections list', () => {
    institutionalService.getAllSections.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component.sections.length).toBe(0);
    expect(component.isLoading).toBeFalse();
  });

  it('should set isLoading to false on error', () => {
    institutionalService.getAllSections.and.returnValue(throwError(() => new Error('Network error')));
    fixture.detectChanges();
    expect(component.isLoading).toBeFalse();
  });
});
