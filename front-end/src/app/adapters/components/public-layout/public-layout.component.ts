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

  private static readonly UNREAD_POLL_INTERVAL_MS = 30_000;

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
  private leftCtrlPressed = false;
  private typedHintBuffer = '';
  private hintTargets: Array<{ hint: string; element: HTMLElement; marker: HTMLSpanElement }> = [];
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
    this.unreadPollSub = interval(PublicLayoutComponent.UNREAD_POLL_INTERVAL_MS)
      .pipe(switchMap(() => this.messagesService.getUnreadCount()))
      .subscribe({
        next: (count) => { this.unreadMessageCount = count; },
        error: () => {}
      });
  }

  ngOnDestroy(): void {
    this.hideKeyboardHints();
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

  @HostListener('window:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    if (event.code === 'ControlLeft') {
      if (!this.leftCtrlPressed) {
        this.leftCtrlPressed = true;
        this.typedHintBuffer = '';
        this.showKeyboardHints();
      }
      return;
    }

    if (!this.leftCtrlPressed) {
      return;
    }

    const key = this.normalizeHintKey(event.key);
    if (!key) {
      return;
    }

    this.typedHintBuffer += key;
    const exactMatch = this.hintTargets.find((target) => target.hint === this.typedHintBuffer);
    if (exactMatch) {
      event.preventDefault();
      event.stopPropagation();
      exactMatch.element.click();
      exactMatch.element.focus();
      this.leftCtrlPressed = false;
      this.typedHintBuffer = '';
      this.hideKeyboardHints();
      return;
    }

    const hasPrefixMatch = this.hintTargets.some((target) => target.hint.startsWith(this.typedHintBuffer));
    if (!hasPrefixMatch) {
      this.typedHintBuffer = '';
    }
  }

  @HostListener('window:keyup', ['$event'])
  onGlobalKeyup(event: KeyboardEvent): void {
    if (event.code !== 'ControlLeft') {
      return;
    }
    this.leftCtrlPressed = false;
    this.typedHintBuffer = '';
    this.hideKeyboardHints();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    if (!this.leftCtrlPressed || this.hintTargets.length === 0) {
      return;
    }
    this.repositionKeyboardHints();
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

  private showKeyboardHints(): void {
    this.hideKeyboardHints();
    const root = document.querySelector('app-public-layout');
    if (!root) {
      return;
    }

    const selector = 'a[href], button:not([disabled]), [role="button"], [role="menuitem"], input[type="button"], input[type="submit"]';
    const elements = Array.from(root.querySelectorAll<HTMLElement>(selector))
      .filter((element) => this.isHintEligible(element));

    elements.forEach((element, index) => {
      const hint = this.toHint(index);
      const marker = document.createElement('span');
      marker.className = 'keyboard-hint-marker';
      marker.textContent = hint;
      marker.setAttribute('aria-hidden', 'true');
      marker.style.position = 'absolute';
      marker.style.zIndex = '2000';
      marker.style.display = 'inline-flex';
      marker.style.alignItems = 'center';
      marker.style.justifyContent = 'center';
      marker.style.minWidth = '1.5rem';
      marker.style.height = '1.5rem';
      marker.style.borderRadius = '999px';
      marker.style.padding = '0 0.35rem';
      marker.style.fontSize = '0.7rem';
      marker.style.fontWeight = '700';
      marker.style.lineHeight = '1';
      marker.style.background = '#111827';
      marker.style.color = '#ffffff';
      marker.style.border = '1px solid #ffffff';
      marker.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.25)';
      marker.style.pointerEvents = 'none';
      marker.style.textTransform = 'uppercase';

      document.body.appendChild(marker);
      this.positionMarker(element, marker);
      this.hintTargets.push({ hint, element, marker });
    });
  }

  private hideKeyboardHints(): void {
    this.hintTargets.forEach((target) => target.marker.remove());
    this.hintTargets = [];
  }

  private normalizeHintKey(value: string): string | null {
    const key = value.trim().toLowerCase();
    return /^[0-9a-z]$/.test(key) ? key : null;
  }

  private toHint(index: number): string {
    const alphabet = '123456789abcdefghijklmnopqrstuvwxyz';
    const base = alphabet.length;
    let value = index;
    let result = '';

    do {
      result = alphabet[value % base] + result;
      value = Math.floor(value / base) - 1;
    } while (value >= 0);

    return result;
  }

  private isHintEligible(element: HTMLElement): boolean {
    if (element.hasAttribute('data-keyboard-hint-ignore')) {
      return false;
    }
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.pointerEvents === 'none') {
      return false;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }
    if (!element.isConnected || element.closest('[aria-hidden="true"]')) {
      return false;
    }
    if (element.classList.contains('public-header__mobile-backdrop')) {
      return false;
    }
    const mobileClosedMenu = element.closest('.public-header__menu') as HTMLElement | null;
    if (mobileClosedMenu && !mobileClosedMenu.classList.contains('public-header__menu--open') && window.innerWidth < 1024) {
      return false;
    }
    return true;
  }

  private repositionKeyboardHints(): void {
    this.hintTargets.forEach((target) => this.positionMarker(target.element, target.marker));
  }

  private positionMarker(element: HTMLElement, marker: HTMLSpanElement): void {
    const rect = element.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    const rawLeft = window.scrollX + rect.left + rect.width - markerRect.width * 0.45;
    const rawTop = window.scrollY + rect.top - markerRect.height * 0.45;
    const minLeft = window.scrollX + 4;
    const maxLeft = window.scrollX + window.innerWidth - markerRect.width - 4;
    const minTop = window.scrollY + 4;

    marker.style.left = `${Math.min(Math.max(rawLeft, minLeft), maxLeft)}px`;
    marker.style.top = `${Math.max(rawTop, minTop)}px`;
  }
}
