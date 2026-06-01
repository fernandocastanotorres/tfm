import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface SearchEntry {
  title: string;
  description: string;
  route: string;
  keywords: string[];
}

@Component({
    selector: 'app-site-search',
    templateUrl: './site-search.component.html',
    styleUrls: ['./site-search.component.css'],
    imports: [FormsModule, NgFor, RouterLink, NgIf, TranslateModule]
})
export class SiteSearchComponent {
  query = '';

  readonly entries: SearchEntry[] = [
    { title: 'PROCEDURES.LICENSE_TITLE', description: 'PROCEDURES.LICENSE_DESC', route: '/sede/procedimientos', keywords: ['tramites', 'procedimientos', 'catalogo'] },
    { title: 'FAQ.TITLE', description: 'FAQ.SUBTITLE', route: '/sede/faq', keywords: ['faq', 'preguntas', 'ayuda'] },
    { title: 'CONTACT.TITLE', description: 'CONTACT.CHANNELS_SUBTITLE', route: '/sede/contacto', keywords: ['contacto', 'telefono', 'correo'] },
    { title: 'CALENDAR.TITLE', description: 'CALENDAR.SUBTITLE', route: '/sede/calendario', keywords: ['calendario', 'eventos', 'fechas'] },
    { title: 'TRANSPARENCY.TITLE', description: 'TRANSPARENCY.SUBTITLE', route: '/sede/transparencia', keywords: ['transparencia', 'informes', 'actividad'] },
    { title: 'LEGISLATION.TITLE', description: 'LEGISLATION.SUBTITLE', route: '/sede/normativa', keywords: ['normativa', 'ley', 'reglamento'] },
    { title: 'ORGANISMS.TITLE', description: 'ORGANISMS.SUBTITLE', route: '/sede/organismo', keywords: ['organismos', 'directorio', 'unidad'] },
    { title: 'PUBLIC.VALIDATE_DOCUMENT', description: 'PUBLIC_HOME.QUICK_DOCUMENT_VERIFICATION_DESC', route: '/sede/validar-documento', keywords: ['csv', 'validar', 'documento'] },
    { title: 'CITIZEN_FOLDER.TITLE', description: 'CITIZEN_FOLDER.SUBTITLE', route: '/sede/carpeta', keywords: ['carpeta', 'expedientes', 'mensajes', 'pagos'] }
  ];

  get filteredEntries(): SearchEntry[] {
    const normalized = this.query.trim().toLowerCase();
    if (!normalized) {
      return this.entries;
    }

    return this.entries.filter((entry) => {
      const inTitle = entry.title.toLowerCase().includes(normalized);
      const inDescription = entry.description.toLowerCase().includes(normalized);
      const inKeywords = entry.keywords.some((keyword) => keyword.includes(normalized));
      return inTitle || inDescription || inKeywords;
    });
  }
}
