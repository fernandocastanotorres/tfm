import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, skip } from 'rxjs';
import { OrganismsService } from '../../../application/services/organisms.service';
import { I18nService } from '../../../application/services/i18n.service';
import { OrganismItem } from '../../../application/models/sede.models';

import { trackByIndex } from '../../../application/utils/track-by.utils';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-organisms-directory',
    templateUrl: './organisms-directory.component.html',
    styleUrls: ['./organisms-directory.component.css'],
    imports: [FormsModule, NgFor, NgIf, TranslatePipe]
})
export class OrganismsDirectoryComponent implements OnInit, OnDestroy {
  organisms: OrganismItem[] = [];
  categories: string[] = [];
  selectedCategory = 'all';
  searchQuery = '';
  isLoading = true;
  private localeSub?: Subscription;

  protected readonly trackByIndex = trackByIndex;

  constructor(
    private readonly organismsService: OrganismsService,
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
    this.organismsService.getCategories().subscribe((cats) => {
      this.categories = cats;
    });
    this.loadOrganisms();
  }

  loadOrganisms(): void {
    this.isLoading = true;
    if (this.searchQuery) {
      this.organismsService.search(this.searchQuery).subscribe({
        next: (data) => {
          this.organisms = data;
          this.isLoading = false;
        }
      });
    } else {
      this.organismsService.getByCategory(this.selectedCategory).subscribe({
        next: (data) => {
          this.organisms = data;
          this.isLoading = false;
        }
      });
    }
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.searchQuery = '';
    this.loadOrganisms();
  }

  onSearch(): void {
    this.loadOrganisms();
  }

  getCategoryLabel(category: string): string {
    return category;
  }
}
