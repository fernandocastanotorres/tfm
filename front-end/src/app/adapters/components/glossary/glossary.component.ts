import { Component, OnInit } from '@angular/core';
import { GlossaryService } from '../../../application/services/glossary.service';
import { GlossaryTerm } from '../../../application/models/sede.models';

@Component({
  selector: 'app-glossary',
  templateUrl: './glossary.component.html',
  styleUrls: ['./glossary.component.css']
})
export class GlossaryComponent implements OnInit {
  terms: GlossaryTerm[] = [];
  letters: string[] = [];
  selectedLetter: string | null = null;
  searchQuery = '';
  isLoading = true;

  constructor(private readonly glossaryService: GlossaryService) {}

  ngOnInit(): void {
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
