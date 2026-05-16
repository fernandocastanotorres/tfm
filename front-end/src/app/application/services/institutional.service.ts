import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { InstitutionalSection } from '../models/sede.models';

@Injectable({
  providedIn: 'root'
})
export class InstitutionalService {
  private readonly sections: InstitutionalSection[] = [
    {
      id: 'mission',
      titleKey: 'INSTITUTIONAL.SECTION_MISSION',
      contentKey: 'INSTITUTIONAL.CONTENT_MISSION',
      icon: 'target'
    },
    {
      id: 'structure',
      titleKey: 'INSTITUTIONAL.SECTION_STRUCTURE',
      contentKey: 'INSTITUTIONAL.CONTENT_STRUCTURE',
      icon: 'building'
    },
    {
      id: 'competences',
      titleKey: 'INSTITUTIONAL.SECTION_COMPETENCES',
      contentKey: 'INSTITUTIONAL.CONTENT_COMPETENCES',
      icon: 'shield'
    },
    {
      id: 'governance',
      titleKey: 'INSTITUTIONAL.SECTION_GOVERNANCE',
      contentKey: 'INSTITUTIONAL.CONTENT_GOVERNANCE',
      icon: 'users'
    },
    {
      id: 'transparency',
      titleKey: 'INSTITUTIONAL.SECTION_TRANSPARENCY',
      contentKey: 'INSTITUTIONAL.CONTENT_TRANSPARENCY',
      icon: 'eye'
    },
    {
      id: 'electronic-office',
      titleKey: 'INSTITUTIONAL.SECTION_ELECTRONIC_OFFICE',
      contentKey: 'INSTITUTIONAL.CONTENT_ELECTRONIC_OFFICE',
      icon: 'monitor'
    }
  ];

  getAllSections(): Observable<InstitutionalSection[]> {
    return of(this.sections).pipe(delay(300));
  }

  getSectionById(id: string): Observable<InstitutionalSection | undefined> {
    const found = this.sections.find(s => s.id === id);
    return of(found).pipe(delay(300));
  }
}
