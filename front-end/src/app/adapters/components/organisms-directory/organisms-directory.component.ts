import { Component, OnInit } from '@angular/core';
import { OrganismsService } from '../../../application/services/organisms.service';
import { OrganismItem } from '../../../application/models/sede.models';

@Component({
  selector: 'app-organisms-directory',
  templateUrl: './organisms-directory.component.html',
  styleUrls: ['./organisms-directory.component.css']
})
export class OrganismsDirectoryComponent implements OnInit {
  organisms: OrganismItem[] = [];
  categories: string[] = [];
  selectedCategory = 'all';
  searchQuery = '';
  isLoading = true;

  constructor(private readonly organismsService: OrganismsService) {}

  ngOnInit(): void {
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
