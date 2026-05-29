import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, skip } from 'rxjs';
import { GlossaryService } from '../../../application/services/glossary.service';
import { I18nService } from '../../../application/services/i18n.service';
import { GlossaryTerm } from '../../../application/models/sede.models';

import { trackByIndex } from '../../../application/utils/track-by.utils';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { SkeletonScreenComponent } from '../../../shared/components/skeleton-screen/skeleton-screen.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-glossary',
    templateUrl: './glossary.component.html',
    styleUrls: ['./glossary.component.css'],
    imports: [RouterLink, FormsModule, NgFor, NgIf, SkeletonScreenComponent, TranslatePipe]
})
export class GlossaryComponent implements OnInit, OnDestroy {
  terms: GlossaryTerm[] = [];
  letters: string[] = [];
  selectedLetter: string | null = null;
  searchQuery = '';
  isLoading = true;
  private localeSub?: Subscription;

  protected readonly trackByIndex = trackByIndex;

  constructor(
    private readonly glossaryService: GlossaryService,
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
    this.glossaryService.getLetters().subscribe((letters) => {
      this.letters = letters;
    });
    this.loadTerms();
  }

  loadTerms(): void {
    this.isLoading = true;
    if (this.searchQuery) {
      this.glossaryService.search(this.searchQuery).subscribe({
        next: (data) => {
          this.terms = data;
          this.isLoading = false;
        }
      });
    } else if (this.selectedLetter) {
      this.glossaryService.getByLetter(this.selectedLetter).subscribe({
        next: (data) => {
          this.terms = data;
          this.isLoading = false;
        }
      });
    } else {
      this.glossaryService.getAll().subscribe({
        next: (data) => {
          this.terms = data;
          this.isLoading = false;
        }
      });
    }
  }

  onLetterSelect(letter: string): void {
    this.selectedLetter = this.selectedLetter === letter ? null : letter;
    this.searchQuery = '';
    this.loadTerms();
  }

  onSearch(): void {
    this.loadTerms();
  }
}
