import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { GlossaryComponent } from './glossary.component';
import { GlossaryService } from '../../../application/services/glossary.service';
import { I18nService } from '../../../application/services/i18n.service';
import { of, Subject } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('GlossaryComponent', () => {
  let component: GlossaryComponent;
  let fixture: ComponentFixture<GlossaryComponent>;
  let glossaryService: jasmine.SpyObj<GlossaryService>;
  let i18nService: I18nService;

  const mockTerms = [
    { id: '1', term: 'Administración', definition: 'Public administration body', relatedTerms: [] },
    { id: '2', term: 'Certificado', definition: 'Official document', relatedTerms: ['Documento'] },
    { id: '3', term: 'Decreto', definition: 'Legal decree', relatedTerms: [] }
  ];

  beforeEach(async () => {
    glossaryService = jasmine.createSpyObj('GlossaryService', ['getAll', 'search', 'getByLetter', 'getLetters']);
    glossaryService.getAll.and.returnValue(of(mockTerms));
    glossaryService.search.and.returnValue(of(mockTerms));
    glossaryService.getByLetter.and.returnValue(of(mockTerms));
    glossaryService.getLetters.and.returnValue(of(['A', 'C', 'D']));

    await TestBed.configureTestingModule({
    declarations: [GlossaryComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [TranslateModule.forRoot(), RouterTestingModule],
    providers: [
        { provide: GlossaryService, useValue: glossaryService },
        I18nService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    i18nService = TestBed.inject(I18nService);
    fixture = TestBed.createComponent(GlossaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load letters and terms on init', () => {
    fixture.detectChanges();
    expect(glossaryService.getLetters).toHaveBeenCalled();
    expect(glossaryService.getAll).toHaveBeenCalled();
    expect(component.letters.length).toBe(3);
    expect(component.terms.length).toBe(3);
  });

  it('should search terms when searchQuery is set', () => {
    component.searchQuery = 'cert';
    fixture.detectChanges();
    expect(glossaryService.search).toHaveBeenCalledWith('cert');
  });

  it('should filter by letter when selectedLetter is set', () => {
    component.selectedLetter = 'C';
    fixture.detectChanges();
    expect(glossaryService.getByLetter).toHaveBeenCalledWith('C');
  });

  it('should toggle letter selection', () => {
    component.onLetterSelect('A');
    expect(component.selectedLetter).toBe('A');
    component.onLetterSelect('A');
    expect(component.selectedLetter).toBeNull();
  });

  it('should clear search when selecting a letter', () => {
    component.searchQuery = 'test';
    component.onLetterSelect('D');
    expect(component.searchQuery).toBe('');
  });

  it('should call loadTerms on search', () => {
    spyOn(component, 'loadTerms');
    component.onSearch();
    expect(component.loadTerms).toHaveBeenCalled();
  });
});
