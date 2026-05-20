import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { FaqComponent } from './faq.component';
import { FaqService } from '../../../application/services/faq.service';
import { I18nService } from '../../../application/services/i18n.service';
import { of, Subject } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('FaqComponent', () => {
  let component: FaqComponent;
  let fixture: ComponentFixture<FaqComponent>;
  let faqService: jasmine.SpyObj<FaqService>;
  let i18nService: I18nService;

  const mockCategories = [
    { id: '1', code: 'general', name: 'General', icon: 'info' },
    { id: '2', code: 'procedures', name: 'Procedures', icon: 'file' }
  ];

  const mockFaqs = [
    { id: '1', categoryCode: 'general', question: 'How do I register?', answer: 'Go to the registration page.' },
    { id: '2', categoryCode: 'procedures', question: 'How long does it take?', answer: 'It depends.' }
  ];

  beforeEach(async () => {
    faqService = jasmine.createSpyObj('FaqService', ['getCategories', 'getFaqsByCategory', 'searchFaqs']);
    faqService.getCategories.and.returnValue(of(mockCategories));
    faqService.getFaqsByCategory.and.returnValue(of(mockFaqs));
    faqService.searchFaqs.and.returnValue(of(mockFaqs));

    await TestBed.configureTestingModule({
    declarations: [FaqComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [TranslateModule.forRoot(), RouterTestingModule],
    providers: [
        { provide: FaqService, useValue: faqService },
        I18nService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    i18nService = TestBed.inject(I18nService);
    fixture = TestBed.createComponent(FaqComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories and FAQs on init', () => {
    fixture.detectChanges();
    expect(faqService.getCategories).toHaveBeenCalled();
    expect(faqService.getFaqsByCategory).toHaveBeenCalledWith('all');
    expect(component.categories.length).toBe(2);
    expect(component.faqs.length).toBe(2);
  });

  it('should search FAQs when searchQuery is set', () => {
    component.searchQuery = 'register';
    fixture.detectChanges();
    expect(faqService.searchFaqs).toHaveBeenCalledWith('register');
  });

  it('should clear search when category changes', () => {
    component.searchQuery = 'test';
    component.onCategoryChange('procedures');
    expect(component.searchQuery).toBe('');
    expect(component.selectedCategory).toBe('procedures');
  });

  it('should toggle FAQ expansion', () => {
    component.toggleFaq('1');
    expect(component.expandedFaq).toBe('1');
    component.toggleFaq('1');
    expect(component.expandedFaq).toBeNull();
  });

  it('should call loadFaqs on search', () => {
    spyOn(component, 'loadFaqs');
    component.onSearch();
    expect(component.loadFaqs).toHaveBeenCalled();
  });
});
