import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { OrganismsDirectoryComponent } from './organisms-directory.component';
import { OrganismsService } from '../../../application/services/organisms.service';
import { I18nService } from '../../../application/services/i18n.service';
import { of, Subject } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('OrganismsDirectoryComponent', () => {
  let component: OrganismsDirectoryComponent;
  let fixture: ComponentFixture<OrganismsDirectoryComponent>;
  let organismsService: jasmine.SpyObj<OrganismsService>;
  let i18nService: I18nService;

  const mockOrganisms = [
    { id: '1', name: 'Ministry of Finance', category: 'ministry', description: 'Finance ministry', phone: '912345678', email: 'contact@finance.es', address: 'Calle Mayor 1' },
    { id: '2', name: 'City Council', category: 'local', description: 'Local council', phone: '912345679', email: 'info@council.es', address: 'Av. Libertad 5' }
  ];

  beforeEach(async () => {
    organismsService = jasmine.createSpyObj('OrganismsService', ['getCategories', 'getByCategory', 'search']);
    organismsService.getCategories.and.returnValue(of(['ministry', 'local']));
    organismsService.getByCategory.and.returnValue(of(mockOrganisms));
    organismsService.search.and.returnValue(of(mockOrganisms));

    await TestBed.configureTestingModule({
    declarations: [OrganismsDirectoryComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [TranslateModule.forRoot(), RouterTestingModule],
    providers: [
        { provide: OrganismsService, useValue: organismsService },
        I18nService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    i18nService = TestBed.inject(I18nService);
    fixture = TestBed.createComponent(OrganismsDirectoryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories and organisms on init', () => {
    fixture.detectChanges();
    expect(organismsService.getCategories).toHaveBeenCalled();
    expect(organismsService.getByCategory).toHaveBeenCalledWith('all');
    expect(component.organisms.length).toBe(2);
  });

  it('should search organisms when searchQuery is set', () => {
    component.searchQuery = 'ministry';
    fixture.detectChanges();
    expect(organismsService.search).toHaveBeenCalledWith('ministry');
  });

  it('should clear search when category changes', () => {
    component.searchQuery = 'test';
    component.onCategoryChange('local');
    expect(component.searchQuery).toBe('');
    expect(component.selectedCategory).toBe('local');
  });

  it('should return category label as-is', () => {
    expect(component.getCategoryLabel('ministry')).toBe('ministry');
  });

  it('should call loadOrganisms on search', () => {
    spyOn(component, 'loadOrganisms');
    component.onSearch();
    expect(component.loadOrganisms).toHaveBeenCalled();
  });
});
