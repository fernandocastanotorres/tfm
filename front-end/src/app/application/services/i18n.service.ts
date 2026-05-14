import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type SupportedLocale = 'es-ES' | 'ca-ES' | 'eu-ES' | 'gl-ES' | 'va-ES';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly supportedLocales: SupportedLocale[] = [
    'es-ES',
    'ca-ES',
    'eu-ES',
    'gl-ES',
    'va-ES'
  ];

  constructor(private readonly translate: TranslateService) {
    this.translate.addLangs(this.supportedLocales);
    this.translate.setDefaultLang('es-ES');
  }

  init(): void {
    const stored = localStorage.getItem('tfg.locale') as SupportedLocale | null;
    const browser = this.translate.getBrowserCultureLang() as SupportedLocale | null;
    const initial = stored && this.supportedLocales.includes(stored) ? stored :
      browser && this.supportedLocales.includes(browser) ? browser : 'es-ES';
    this.setLocale(initial);
  }

  setLocale(locale: SupportedLocale): void {
    this.translate.use(locale);
    localStorage.setItem('tfg.locale', locale);
  }

  getLocales(): SupportedLocale[] {
    return this.supportedLocales;
  }

  getCurrentLocale(): SupportedLocale {
    return (this.translate.currentLang || 'es-ES') as SupportedLocale;
  }
}
