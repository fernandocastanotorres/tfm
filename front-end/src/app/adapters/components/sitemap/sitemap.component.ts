import { Component } from '@angular/core';
import { SitemapSection, SitemapLink } from '../../../application/models/sede.models';

import { trackByIndex } from '../../../application/utils/track-by.utils';

@Component({
    selector: 'app-sitemap',
    templateUrl: './sitemap.component.html',
    styleUrls: ['./sitemap.component.css'],
    standalone: false
})
export class SitemapComponent {
  readonly sections: SitemapSection[] = [
    {
      id: 'public',
      titleKey: 'SITEMAP.SECTION_PUBLIC',
      links: [
        { labelKey: 'SITEMAP.LINK_HOME', route: '/sede' },
        { labelKey: 'SITEMAP.LINK_PROCEDURES', route: '/sede/procedimientos' },
        { labelKey: 'SITEMAP.LINK_FAQ', route: '/sede/faq' },
        { labelKey: 'SITEMAP.LINK_CONTACT', route: '/sede/contacto' },
        { labelKey: 'SITEMAP.LINK_STATUS', route: '/sede/estado' }
      ]
    },
    {
      id: 'institutional',
      titleKey: 'SITEMAP.SECTION_INSTITUTIONAL',
      links: [
        { labelKey: 'SITEMAP.LINK_INSTITUTIONAL', route: '/sede/institucional' },
        { labelKey: 'SITEMAP.LINK_LEGISLATION', route: '/sede/normativa' },
        { labelKey: 'SITEMAP.LINK_ORGANISMS', route: '/sede/organismo' },
        { labelKey: 'SITEMAP.LINK_TRANSPARENCY', route: '/sede/transparencia' }
      ]
    },
    {
      id: 'resources',
      titleKey: 'SITEMAP.SECTION_RESOURCES',
      links: [
        { labelKey: 'SITEMAP.LINK_CALENDAR', route: '/sede/calendario' },
        { labelKey: 'SITEMAP.LINK_GLOSSARY', route: '/sede/glosario' },
        { labelKey: 'SITEMAP.LINK_ACCESSIBILITY', route: '/sede/accesibilidad' },
        { labelKey: 'SITEMAP.LINK_SITEMAP', route: '/sede/mapa' }
      ]
    },
    {
      id: 'authenticated',
      titleKey: 'SITEMAP.SECTION_AUTHENTICATED',
      links: [
        { labelKey: 'SITEMAP.LINK_LOGIN', route: '/sede/login' },
        { labelKey: 'SITEMAP.LINK_REGISTER', route: '/sede/registro' },
        { labelKey: 'SITEMAP.LINK_RECOVERY', route: '/sede/recuperacion' },
        { labelKey: 'SITEMAP.LINK_DASHBOARD', route: '/dashboard' },
        { labelKey: 'SITEMAP.LINK_PROFILE', route: '/perfil' },
        { labelKey: 'SITEMAP.LINK_NOTIFICATIONS', route: '/notificaciones' },
        { labelKey: 'SITEMAP.LINK_DOCUMENTS', route: '/documentos' },
        { labelKey: 'SITEMAP.LINK_PAYMENTS', route: '/pagos' },
        { labelKey: 'SITEMAP.LINK_APPOINTMENTS', route: '/sede/citas' },
        { labelKey: 'SITEMAP.LINK_MESSAGES', route: '/mensajes' }
      ]
    }
  ];

  protected readonly trackByIndex = trackByIndex;
}
