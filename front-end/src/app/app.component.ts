import { Component, OnInit } from '@angular/core';
import { I18nService, SupportedLocale } from './application/services/i18n.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  locales: { code: SupportedLocale; label: string }[] = [];
  currentLocale: SupportedLocale = 'es-ES';

  constructor(private readonly i18nService: I18nService) {}

  ngOnInit(): void {
    this.i18nService.init();
    this.locales = [
      { code: 'es-ES', label: 'Español' },
      { code: 'ca-ES', label: 'Català' },
      { code: 'eu-ES', label: 'Euskara' },
      { code: 'gl-ES', label: 'Galego' },
      { code: 'va-ES', label: 'Valencià' }
    ];
    this.currentLocale = this.i18nService.getCurrentLocale();
  }

  switchLocale(locale: SupportedLocale): void {
    this.i18nService.setLocale(locale);
    this.currentLocale = locale;
  }
}
