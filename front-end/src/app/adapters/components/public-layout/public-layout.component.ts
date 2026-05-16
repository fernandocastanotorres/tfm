import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService, SupportedLocale } from '../../../application/services/i18n.service';
import { Observable, Subscription } from 'rxjs';

export interface MenuGroup {
  labelKey: string;
  items: MenuItem[];
}

export interface MenuItem {
  labelKey: string;
  route: string;
}

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.css']
})
export class PublicLayoutComponent implements OnInit, OnDestroy {
  menuOpen = false;
  activeDropdown: string | null = null;
  locales: { code: SupportedLocale; label: string }[] = [];
  currentLocale$: Observable<SupportedLocale>;
  currentLocale: SupportedLocale = 'es-ES';
  isAuthPage = false;
  private localeSub?: Subscription;
  private routeSub?: Subscription;

  readonly menuGroups: MenuGroup[] = [
    {
      labelKey: 'PUBLIC.MENU_PROCEDURES',
      items: [
        { labelKey: 'PUBLIC.NAV_PROCEDURES', route: '/sede/procedimientos' },
        { labelKey: 'PUBLIC.NAV_FAQ', route: '/sede/faq' },
        { labelKey: 'PUBLIC.NAV_CALENDAR', route: '/sede/calendario' }
      ]
    },
    {
      labelKey: 'PUBLIC.MENU_INFO',
      items: [
        { labelKey: 'PUBLIC.NAV_INSTITUTIONAL', route: '/sede/institucional' },
        { labelKey: 'PUBLIC.NAV_LEGISLATION', route: '/sede/normativa' },
        { labelKey: 'PUBLIC.NAV_ORGANISMS', route: '/sede/organismo' },
        { labelKey: 'PUBLIC.NAV_TRANSPARENCY', route: '/sede/transparencia' }
      ]
    },
    {
      labelKey: 'PUBLIC.MENU_RESOURCES',
      items: [
        { labelKey: 'PUBLIC.NAV_CONTACT', route: '/sede/contacto' },
        { labelKey: 'PUBLIC.NAV_STATUS', route: '/sede/estado' },
        { labelKey: 'PUBLIC.NAV_GLOSSARY', route: '/sede/glosario' }
      ]
    }
  ];

  constructor(
    private readonly i18nService: I18nService,
    private readonly router: Router
  ) {
    this.currentLocale$ = this.i18nService.getCurrentLocale$();
  }

  ngOnInit(): void {
    this.locales = [
      { code: 'es-ES', label: 'Espanol' },
      { code: 'ca-ES', label: 'Catala' },
      { code: 'eu-ES', label: 'Euskara' },
      { code: 'gl-ES', label: 'Galego' },
      { code: 'va-ES', label: 'Valencia' }
    ];
    this.localeSub = this.i18nService.getCurrentLocale$().subscribe(locale => {
      this.currentLocale = locale;
    });
    this.routeSub = this.router.events.subscribe(() => {
      const url = this.router.url;
      this.isAuthPage = url.includes('/sede/login') || url.includes('/sede/registro') || url.includes('/sede/recuperacion');
    });
  }

  ngOnDestroy(): void {
    this.localeSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }

  switchLocale(locale: SupportedLocale): void {
    this.i18nService.setLocale(locale);
  }

  toggleDropdown(groupLabel: string): void {
    this.activeDropdown = this.activeDropdown === groupLabel ? null : groupLabel;
  }

  closeDropdown(): void {
    this.activeDropdown = null;
  }

  toggleMobileMenu(): void {
    this.menuOpen = !this.menuOpen;
    if (!this.menuOpen) {
      this.activeDropdown = null;
    }
  }

  onDropdownFocusOut(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    if (!relatedTarget || !relatedTarget.closest('.public-header__dropdown')) {
      this.closeDropdown();
    }
  }
}
