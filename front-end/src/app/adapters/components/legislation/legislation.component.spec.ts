import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { LegislationComponent } from './legislation.component';
import { LegislationService } from '../../../application/services/legislation.service';
import { I18nService } from '../../../application/services/i18n.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('LegislationComponent', () => {
  let component: LegislationComponent;
  let fixture: ComponentFixture<LegislationComponent>;
  let legislationService: jasmine.SpyObj<LegislationService>;

  const mockLegislation = [
    { id: '1', title: 'Law 39/2015', type: 'law' as const, date: '2015-10-01', description: 'Administrative procedure law', externalUrl: 'https://example.com/law1' },
    { id: '2', title: 'Royal Decree 202/2020', type: 'decree' as const, date: '2020-03-01', description: 'Digital administration decree', externalUrl: 'https://example.com/decree1' }
  ];

  beforeEach(async () => {
    legislationService = jasmine.createSpyObj('LegislationService', ['getTypes', 'getByType']);
    legislationService.getTypes.and.returnValue(of(['law', 'decree']));
    legislationService.getByType.and.returnValue(of(mockLegislation));

    await TestBed.configureTestingModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [TranslateModule.forRoot(), RouterTestingModule, LegislationComponent],
    providers: [
        { provide: LegislationService, useValue: legislationService },
        I18nService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(LegislationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load types and legislation on init', () => {
    fixture.detectChanges();
    expect(legislationService.getTypes).toHaveBeenCalled();
    expect(legislationService.getByType).toHaveBeenCalledWith('all');
    expect(component.legislation.length).toBe(2);
    expect(component.isLoading).toBeFalse();
  });

  it('should change type and reload', () => {
    fixture.detectChanges();
    component.onTypeChange('decree');
    expect(legislationService.getByType).toHaveBeenCalledWith('decree');
    expect(component.selectedType).toBe('decree');
  });

  it('should return correct type label for law', () => {
    expect(component.getTypeLabel('law')).toBe('LEGISLATION.TYPE_LAW');
  });

  it('should return correct type label for all', () => {
    expect(component.getTypeLabel('all')).toBe('LEGISLATION.TYPE_ALL');
  });

  it('should return type as-is for unknown type', () => {
    expect(component.getTypeLabel('unknown')).toBe('unknown');
  });

  it('should format date correctly', () => {
    const result = component.formatDate('2015-10-01');
    expect(result).toContain('2015');
  });
});
