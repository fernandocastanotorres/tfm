import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

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
    imports: [FormsModule, NgFor, RouterLink, NgIf]
})
export class SiteSearchComponent {
  query = '';

  readonly entries: SearchEntry[] = [
    { title: 'Catalogo de tramites', description: 'Consulta y comienza procedimientos.', route: '/sede/procedimientos', keywords: ['tramites', 'procedimientos', 'catalogo'] },
    { title: 'FAQ', description: 'Preguntas frecuentes de la sede.', route: '/sede/faq', keywords: ['faq', 'preguntas', 'ayuda'] },
    { title: 'Contacto', description: 'Canales de contacto ciudadano.', route: '/sede/contacto', keywords: ['contacto', 'telefono', 'correo'] },
    { title: 'Calendario', description: 'Eventos y fechas relevantes.', route: '/sede/calendario', keywords: ['calendario', 'eventos', 'fechas'] },
    { title: 'Transparencia', description: 'Informes y actividad publica.', route: '/sede/transparencia', keywords: ['transparencia', 'informes', 'actividad'] },
    { title: 'Normativa', description: 'Marco legal y regulatorio.', route: '/sede/normativa', keywords: ['normativa', 'ley', 'reglamento'] },
    { title: 'Directorio de organismos', description: 'Unidades y organismos disponibles.', route: '/sede/organismo', keywords: ['organismos', 'directorio', 'unidad'] },
    { title: 'Validar documento', description: 'Verificacion por CSV.', route: '/sede/validar-documento', keywords: ['csv', 'validar', 'documento'] },
    { title: 'Carpeta Ciudadana', description: 'Vista unificada de tu actividad.', route: '/sede/carpeta', keywords: ['carpeta', 'expedientes', 'mensajes', 'pagos'] }
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
