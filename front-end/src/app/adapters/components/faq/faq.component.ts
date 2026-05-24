import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FaqService } from '../../../application/services/faq.service';
import { I18nService } from '../../../application/services/i18n.service';
import { FaqCategory, FaqItem } from '../../../application/models/sede.models';

import { trackByIndex } from '../../../application/utils/track-by.utils';

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.css'],
    standalone: false
})
export class FaqComponent implements OnInit, OnDestroy {
  categories: FaqCategory[] = [];
  faqs: FaqItem[] = [];
  selectedCategory = 'all';
  searchQuery = '';
  expandedFaq: string | null = null;
  isLoading = true;
  private localeSub?: Subscription;

  protected readonly trackByIndex = trackByIndex;

  constructor(
    private readonly faqService: FaqService,
    private readonly i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.localeSub = this.i18nService.getCurrentLocale$().subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.localeSub?.unsubscribe();
  }

  loadData(): void {
    this.isLoading = true;
    this.faqService.getCategories().subscribe((cats) => {
      this.categories = cats;
    });
    this.loadFaqs();
  }

  loadFaqs(): void {
    this.isLoading = true;
    if (this.searchQuery) {
      this.faqService.searchFaqs(this.searchQuery).subscribe({
        next: (data) => {
          this.faqs = data;
          this.isLoading = false;
        }
      });
    } else {
      this.faqService.getFaqsByCategory(this.selectedCategory).subscribe({
        next: (data) => {
          this.faqs = data;
          this.isLoading = false;
        }
      });
    }
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.searchQuery = '';
    this.loadFaqs();
  }

  onSearch(): void {
    this.loadFaqs();
  }

  toggleFaq(id: string): void {
    this.expandedFaq = this.expandedFaq === id ? null : id;
  }
}
