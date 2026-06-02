import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, skip } from 'rxjs';
import { FaqService } from '../../../application/services/faq.service';
import { I18nService } from '../../../application/services/i18n.service';
import { FaqCategory, FaqItem } from '../../../application/models/sede.models';

import { trackByIndex } from '../../../application/utils/track-by.utils';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.css'],
    imports: [FormsModule, NgFor, NgIf, TranslatePipe]
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
    // Avoid double-fetch on init if the locale observable emits immediately.
    this.localeSub = this.i18nService.getCurrentLocale$().pipe(skip(1)).subscribe(() => this.loadData());
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
