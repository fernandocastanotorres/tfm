import { Component, OnInit } from '@angular/core';
import { InstitutionalService } from '../../../application/services/institutional.service';
import { InstitutionalSection } from '../../../application/models/sede.models';

@Component({
  selector: 'app-institutional-info',
  templateUrl: './institutional-info.component.html',
  styleUrls: ['./institutional-info.component.css']
})
export class InstitutionalInfoComponent implements OnInit {
  sections: InstitutionalSection[] = [];
  isLoading = true;

  constructor(private readonly institutionalService: InstitutionalService) {}

  ngOnInit(): void {
    this.institutionalService.getAllSections().subscribe({
      next: (sections) => {
        this.sections = sections;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
