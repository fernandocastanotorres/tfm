import { Component, OnInit } from '@angular/core';
import { FaqService } from '../../../application/services/faq.service';
import { FaqCategory, FaqItem } from '../../../application/models/sede.models';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {
  categories: FaqCategory[] = [];
  faqs: FaqItem[] = [];
  selectedCategory = 'all';
  searchQuery = '';
  expandedFaq: string | null = null;
  isLoading = true;

  constructor(private readonly faqService: FaqService) {}

  ngOnInit(): void {
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
