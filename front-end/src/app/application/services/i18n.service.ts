import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

  private readonly currentLocale$ = new BehaviorSubject<SupportedLocale>('es-ES');

  constructor(private readonly translate: TranslateService) {
    this.translate.addLangs(this.supportedLocales);
  }

  init(): void {
    const stored = localStorage.getItem('tfg.locale') as SupportedLocale | null;
    const browser = this.translate.getBrowserCultureLang() as SupportedLocale | null;
    const initial = stored && this.supportedLocales.includes(stored) ? stored :
      browser && this.supportedLocales.includes(browser) ? browser : 'es-ES';
    this.translate.onLangChange.subscribe((event) => {
      this.currentLocale$.next(event.lang as SupportedLocale);
    });
    this.setLocale(initial);
  }

  setLocale(locale: SupportedLocale): void {
    this.translate.use(locale).subscribe({
      next: () => {
        localStorage.setItem('tfg.locale', locale);
      }
    });
  }

  getCurrentLocale$(): Observable<SupportedLocale> {
    return this.currentLocale$.asObservable();
  }

  getCurrentLocale(): SupportedLocale {
    return this.currentLocale$.getValue();
  }

  getLocales(): SupportedLocale[] {
    return this.supportedLocales;
  }
}
