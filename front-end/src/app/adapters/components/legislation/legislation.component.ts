import { Component, OnInit } from '@angular/core';
import { LegislationService } from '../../../application/services/legislation.service';
import { LegislationItem } from '../../../application/models/sede.models';

@Component({
  selector: 'app-legislation',
  templateUrl: './legislation.component.html',
  styleUrls: ['./legislation.component.css']
})
export class LegislationComponent implements OnInit {
  legislation: LegislationItem[] = [];
  types: string[] = [];
  selectedType = 'all';
  isLoading = true;

  constructor(private readonly legislationService: LegislationService) {}

  ngOnInit(): void {
    this.legislationService.getTypes().subscribe((types) => {
      this.types = types;
    });
    this.loadLegislation();
  }

  loadLegislation(): void {
    this.isLoading = true;
    this.legislationService.getByType(this.selectedType).subscribe({
      next: (data) => {
        this.legislation = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onTypeChange(type: string): void {
    this.selectedType = type;
    this.loadLegislation();
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'all': 'LEGISLATION.TYPE_ALL',
      'law': 'LEGISLATION.TYPE_LAW',
      'decree': 'LEGISLATION.TYPE_DECREE',
      'order': 'LEGISLATION.TYPE_ORDER',
      'resolution': 'LEGISLATION.TYPE_RESOLUTION'
    };
    return labels[type] || type;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
