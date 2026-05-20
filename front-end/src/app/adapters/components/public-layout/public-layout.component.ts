import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService, SupportedLocale } from '../../../application/services/i18n.service';
import { GuidedTourService } from '../../../application/services/guided-tour.service';
import { AuthService } from '../../../application/services/auth.service';
import { MessagesService } from '../../../application/services/messages.service';
import { Observable, Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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
    styleUrls: ['./public-layout.component.css'],
    standalone: false
})
export class PublicLayoutComponent implements OnInit, OnDestroy {
  menuOpen = false;
  activeDropdown: string | null = null;
  locales: { code: SupportedLocale; label: string }[] = [];
  currentLocale$: Observable<SupportedLocale>;
  currentLocale: SupportedLocale = 'es-ES';
  isAuthPage = false;
  isDarkMode = false;
  isAuthenticated = false;
  authenticatedUserLabel = '';
  userMenuOpen = false;
  unreadMessageCount = 0;
  private localeSub?: Subscription;
  private routeSub?: Subscription;
  private unreadPollSub?: Subscription;

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
    private readonly router: Router,
    private readonly guidedTourService: GuidedTourService,
    private readonly authService: AuthService,
    private readonly messagesService: MessagesService
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
    this.initTheme();
    this.refreshAuthState();
    this.updateRouteState(this.router.url);
    this.routeSub = this.router.events.subscribe(() => {
      this.refreshAuthState();
      this.updateRouteState(this.router.url);
      this.menuOpen = false;
      this.activeDropdown = null;
      this.userMenuOpen = false;
    });
    this.loadUnreadMessageCount();
    this.unreadPollSub = interval(30000)
      .pipe(switchMap(() => this.messagesService.getUnreadCount()))
      .subscribe({
        next: (count) => { this.unreadMessageCount = count; },
        error: () => {}
      });
  }

  ngOnDestroy(): void {
    this.unlockBodyScroll();
    this.localeSub?.unsubscribe();
    this.routeSub?.unsubscribe();
    this.unreadPollSub?.unsubscribe();
  }

  switchLocale(locale: SupportedLocale): void {
    this.i18nService.setLocale(locale);
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme(this.isDarkMode);
    localStorage.setItem('tfg.theme', this.isDarkMode ? 'dark' : 'light');
  }

  toggleDropdown(groupLabel: string): void {
    this.activeDropdown = this.activeDropdown === groupLabel ? null : groupLabel;
  }

  closeDropdown(): void {
    this.activeDropdown = null;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  onUserMenuFocusOut(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    if (!relatedTarget || !relatedTarget.closest('.public-header__user')) {
      this.closeUserMenu();
    }
  }

  onChangePassword(): void {
    this.closeUserMenu();
    this.router.navigate(['/sede/perfil']);
  }

  onSearchCases(): void {
    this.closeUserMenu();
    this.router.navigate(['/sede/expedientes/buscar']);
  }

  onMessages(): void {
    this.closeUserMenu();
    this.unreadMessageCount = 0;
    this.router.navigate(['/sede/mensajes']);
  }

  loadUnreadMessageCount(): void {
    if (this.isAuthenticated) {
      this.messagesService.getUnreadCount().subscribe({
        next: (count) => { this.unreadMessageCount = count; },
        error: () => {}
      });
    }
  }

  onProfile(): void {
    this.closeUserMenu();
    this.router.navigate(['/sede/perfil']);
  }

  onLogout(): void {
    this.closeUserMenu();
    this.authService.logout().subscribe(() => {
      this.refreshAuthState();
      this.router.navigate(['/sede']);
    });
  }

  closeMobileMenu(): void {
    this.menuOpen = false;
    this.activeDropdown = null;
    this.unlockBodyScroll();
  }

  toggleMobileMenu(): void {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      this.lockBodyScroll();
    } else {
      this.unlockBodyScroll();
    }
    if (!this.menuOpen) {
      this.activeDropdown = null;
    }
  }

  onMobileMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeMobileMenu();
    }
  }

  @HostListener('window:keydown.escape')
  onEscapeKey(): void {
    if (this.menuOpen) {
      this.closeMobileMenu();
    }
  }

  onDropdownFocusOut(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    if (!relatedTarget || !relatedTarget.closest('.public-header__dropdown')) {
      this.closeDropdown();
    }
  }

  startTour(): void {
    this.guidedTourService.startCitizenTour(this.router.url);
  }

  private updateRouteState(url: string): void {
    this.isAuthPage = url.includes('/sede/login') || url.includes('/sede/registro') || url.includes('/sede/recuperacion');
  }

  private refreshAuthState(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    const label = this.authService.getAuthenticatedUserLabel();
    this.authenticatedUserLabel = label ?? 'Usuario';
  }

  private initTheme(): void {
    const storedTheme = localStorage.getItem('tfg.theme');
    this.isDarkMode = storedTheme === 'dark';
    this.applyTheme(this.isDarkMode);
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.body.classList.add('theme-dark');
      return;
    }
    document.body.classList.remove('theme-dark');
  }

  private lockBodyScroll(): void {
    document.body.classList.add('mobile-menu-open');
  }

  private unlockBodyScroll(): void {
    document.body.classList.remove('mobile-menu-open');
  }
}
