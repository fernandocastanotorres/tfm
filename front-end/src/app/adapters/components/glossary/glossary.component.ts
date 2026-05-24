import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GlossaryService } from '../../../application/services/glossary.service';
import { I18nService } from '../../../application/services/i18n.service';
import { GlossaryTerm } from '../../../application/models/sede.models';

import { trackByIndex } from '../../../application/utils/track-by.utils';

@Component({
    selector: 'app-glossary',
    templateUrl: './glossary.component.html',
    styleUrls: ['./glossary.component.css'],
    standalone: false
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
    this.localeSub = this.i18nService.getCurrentLocale$().subscribe(() => {
      this.loadData();
    });
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
