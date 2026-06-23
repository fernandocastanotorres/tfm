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
    this.translate.setDefaultLang('es-ES');
  }

  init(): void {
    const stored = localStorage.getItem('tfm.locale') as SupportedLocale | null;
    const browser = this.translate.getBrowserCultureLang() as SupportedLocale | null;

    let initial: SupportedLocale = 'es-ES';
    if (stored && this.supportedLocales.includes(stored)) {
      initial = stored;
    } else if (browser && this.supportedLocales.includes(browser)) {
      initial = browser;
    }

    this.translate.onLangChange.subscribe((event) => {
      this.currentLocale$.next(event.lang as SupportedLocale);
    });
    this.setLocale(initial);
  }

  setLocale(locale: SupportedLocale): void {
    localStorage.setItem('tfm.locale', locale);
    this.translate.use(locale);
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
