import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { PublicLayoutComponent } from './public-layout.component';
import { I18nService, SupportedLocale } from '../../../application/services/i18n.service';
import { GuidedTourService } from '../../../application/services/guided-tour.service';
import { AuthService } from '../../../application/services/auth.service';
import { MessagesService } from '../../../application/services/messages.service';
import { HttpClientTestingModule, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PublicLayoutComponent', () => {
  let component: PublicLayoutComponent;
  let fixture: ComponentFixture<PublicLayoutComponent>;
  let i18nSpy: jasmine.SpyObj<I18nService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let tourSpy: jasmine.SpyObj<GuidedTourService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let messagesSpy: jasmine.SpyObj<MessagesService>;
  let localeSubject: Subject<SupportedLocale>;

  beforeEach(() => {
    localeSubject = new Subject<SupportedLocale>();
    i18nSpy = jasmine.createSpyObj('I18nService', ['getCurrentLocale$', 'setLocale']);
    i18nSpy.getCurrentLocale$.and.returnValue(localeSubject.asObservable());
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      url: '/sede',
      events: of({})
    });
    tourSpy = jasmine.createSpyObj('GuidedTourService', ['startCitizenTour']);
    authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getAuthenticatedUserLabel', 'logout']);
    authSpy.isAuthenticated.and.returnValue(false);
    authSpy.getAuthenticatedUserLabel.and.returnValue(null);
    authSpy.logout.and.returnValue(of(undefined));
    messagesSpy = jasmine.createSpyObj('MessagesService', ['getUnreadCount']);
    messagesSpy.getUnreadCount.and.returnValue(of(0));

    localStorage.clear();

    TestBed.configureTestingModule({
      declarations: [PublicLayoutComponent],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: I18nService, useValue: i18nSpy },
        { provide: Router, useValue: routerSpy },
        { provide: GuidedTourService, useValue: tourSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: MessagesService, useValue: messagesSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(PublicLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  // ─── Initialization ────────────────────────────────────────────────────────

  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with 5 locales', () => {
      expect(component.locales.length).toBe(5);
      expect(component.locales.map(l => l.code)).toEqual([
        'es-ES', 'ca-ES', 'eu-ES', 'gl-ES', 'va-ES'
      ]);
    });

    it('should initialize with 3 menu groups', () => {
      expect(component.menuGroups.length).toBe(3);
      expect(component.menuGroups[0].labelKey).toBe('PUBLIC.MENU_PROCEDURES');
      expect(component.menuGroups[1].labelKey).toBe('PUBLIC.MENU_INFO');
      expect(component.menuGroups[2].labelKey).toBe('PUBLIC.MENU_RESOURCES');
    });

    it('should subscribe to locale changes and update currentLocale', fakeAsync(() => {
      localeSubject.next('ca-ES');
      tick();
      expect(component.currentLocale).toBe('ca-ES');
    }));

    it('should refresh auth state on init', () => {
      expect(authSpy.isAuthenticated).toHaveBeenCalled();
      expect(authSpy.getAuthenticatedUserLabel).toHaveBeenCalled();
    });
  });

  // ─── Locale Switching ──────────────────────────────────────────────────────

  describe('Locale Switching', () => {
    it('switchLocale should call i18nService.setLocale', () => {
      component.switchLocale('eu-ES');
      expect(i18nSpy.setLocale).toHaveBeenCalledWith('eu-ES');
    });

    it('should update currentLocale when locale observable emits', fakeAsync(() => {
      expect(component.currentLocale).toBe('es-ES');
      localeSubject.next('gl-ES');
      tick();
      expect(component.currentLocale).toBe('gl-ES');
    }));
  });

  // ─── Theme ─────────────────────────────────────────────────────────────────

  describe('Theme', () => {
    it('toggleTheme should switch from light to dark', () => {
      expect(component.isDarkMode).toBeFalse();
      spyOn(document.body.classList, 'add');
      spyOn(document.body.classList, 'remove');

      component.toggleTheme();

      expect(component.isDarkMode).toBeTrue();
      expect(document.body.classList.add).toHaveBeenCalledWith('theme-dark');
    });

    it('toggleTheme should switch from dark to light', () => {
      component.isDarkMode = true;
      spyOn(document.body.classList, 'add');
      spyOn(document.body.classList, 'remove');

      component.toggleTheme();

      expect(component.isDarkMode).toBeFalse();
      expect(document.body.classList.remove).toHaveBeenCalledWith('theme-dark');
    });

    it('toggleTheme should save theme to localStorage', () => {
      spyOn(localStorage, 'setItem');

      component.toggleTheme();
      expect(localStorage.setItem).toHaveBeenCalledWith('tfg.theme', 'dark');

      component.toggleTheme();
      expect(localStorage.setItem).toHaveBeenCalledWith('tfg.theme', 'light');
    });

    it('initTheme should read dark theme from localStorage', () => {
      localStorage.setItem('tfg.theme', 'dark');
      spyOn(document.body.classList, 'add');

      // Recreate component to trigger initTheme with stored value
      fixture = TestBed.createComponent(PublicLayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.isDarkMode).toBeTrue();
      expect(document.body.classList.add).toHaveBeenCalledWith('theme-dark');
    });
  });

  // ─── Mobile Menu ───────────────────────────────────────────────────────────

  describe('Mobile Menu', () => {
    it('toggleMobileMenu should open menu and lock body scroll', () => {
      spyOn(document.body.classList, 'add');
      component.menuOpen = false;

      component.toggleMobileMenu();

      expect(component.menuOpen).toBeTrue();
      expect(document.body.classList.add).toHaveBeenCalledWith('mobile-menu-open');
    });

    it('toggleMobileMenu should close menu and unlock body scroll', () => {
      component.menuOpen = true;
      spyOn(document.body.classList, 'remove');

      component.toggleMobileMenu();

      expect(component.menuOpen).toBeFalse();
      expect(document.body.classList.remove).toHaveBeenCalledWith('mobile-menu-open');
      expect(component.activeDropdown).toBeNull();
    });

    it('closeMobileMenu should reset state and unlock scroll', () => {
      component.menuOpen = true;
      component.activeDropdown = 'some-group';
      spyOn(document.body.classList, 'remove');

      component.closeMobileMenu();

      expect(component.menuOpen).toBeFalse();
      expect(component.activeDropdown).toBeNull();
      expect(document.body.classList.remove).toHaveBeenCalledWith('mobile-menu-open');
    });

    it('onMobileMenuKeydown should close menu on Escape', () => {
      component.menuOpen = true;
      spyOn(component, 'closeMobileMenu');

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component.onMobileMenuKeydown(event);

      expect(component.closeMobileMenu).toHaveBeenCalled();
    });

    it('onEscapeKey HostListener should close mobile menu when open', () => {
      component.menuOpen = true;
      spyOn(component, 'closeMobileMenu');

      component.onEscapeKey();

      expect(component.closeMobileMenu).toHaveBeenCalled();
    });
  });

  // ─── Dropdown ──────────────────────────────────────────────────────────────

  describe('Dropdown', () => {
    it('toggleDropdown should open dropdown', () => {
      expect(component.activeDropdown).toBeNull();

      component.toggleDropdown('PUBLIC.MENU_PROCEDURES');

      expect(component.activeDropdown).toBe('PUBLIC.MENU_PROCEDURES');
    });

    it('toggleDropdown should close same dropdown when toggled again', () => {
      component.activeDropdown = 'PUBLIC.MENU_INFO';

      component.toggleDropdown('PUBLIC.MENU_INFO');

      expect(component.activeDropdown).toBeNull();
    });

    it('closeDropdown should clear activeDropdown', () => {
      component.activeDropdown = 'PUBLIC.MENU_RESOURCES';

      component.closeDropdown();

      expect(component.activeDropdown).toBeNull();
    });
  });

  // ─── User Menu ─────────────────────────────────────────────────────────────

  describe('User Menu', () => {
    it('toggleUserMenu should open user menu', () => {
      expect(component.userMenuOpen).toBeFalse();

      component.toggleUserMenu();

      expect(component.userMenuOpen).toBeTrue();
    });

    it('closeUserMenu should close user menu', () => {
      component.userMenuOpen = true;

      component.closeUserMenu();

      expect(component.userMenuOpen).toBeFalse();
    });

    it('onUserMenuFocusOut should close when focus leaves container', () => {
      component.userMenuOpen = true;
      const event = { relatedTarget: null } as unknown as FocusEvent;

      component.onUserMenuFocusOut(event);

      expect(component.userMenuOpen).toBeFalse();
    });

    it('onUserMenuFocusOut should not close when focus stays within container', () => {
      component.userMenuOpen = true;
      const mockElement = document.createElement('div');
      mockElement.classList.add('public-header__user');
      const relatedTarget = document.createElement('span');
      mockElement.appendChild(relatedTarget);
      spyOn(relatedTarget, 'closest').and.returnValue(mockElement);
      const event = { relatedTarget } as unknown as FocusEvent;

      component.onUserMenuFocusOut(event);

      expect(component.userMenuOpen).toBeTrue();
    });

    it('onDropdownFocusOut should close when focus leaves dropdown', () => {
      component.activeDropdown = 'PUBLIC.MENU_INFO';
      const event = { relatedTarget: null } as unknown as FocusEvent;

      component.onDropdownFocusOut(event);

      expect(component.activeDropdown).toBeNull();
    });
  });

  // ─── Navigation Actions ────────────────────────────────────────────────────

  describe('Navigation Actions', () => {
    it('onChangePassword should close menu and navigate to profile', () => {
      spyOn(component, 'closeUserMenu');

      component.onChangePassword();

      expect(component.closeUserMenu).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/sede/perfil']);
    });

    it('onSearchCases should close menu and navigate to search', () => {
      spyOn(component, 'closeUserMenu');

      component.onSearchCases();

      expect(component.closeUserMenu).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/sede/expedientes/buscar']);
    });

    it('onMessages should close menu and navigate to messages', () => {
      spyOn(component, 'closeUserMenu');

      component.onMessages();

      expect(component.closeUserMenu).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/sede/mensajes']);
    });

    it('onProfile should close menu and navigate to profile', () => {
      spyOn(component, 'closeUserMenu');

      component.onProfile();

      expect(component.closeUserMenu).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/sede/perfil']);
    });

    it('onLogout should close menu, call logout, and navigate to home', fakeAsync(() => {
      spyOn(component, 'closeUserMenu');
      authSpy.isAuthenticated.and.returnValue(false);

      component.onLogout();
      tick();

      expect(component.closeUserMenu).toHaveBeenCalled();
      expect(authSpy.logout).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/sede']);
    }));

    it('updateRouteState should set isAuthPage for login/register/recovery routes', () => {
      // Access private method via (component as any)
      const updateRouteState = (component as any).updateRouteState.bind(component);

      updateRouteState('/sede/login');
      expect(component.isAuthPage).toBeTrue();

      updateRouteState('/sede/registro');
      expect(component.isAuthPage).toBeTrue();

      updateRouteState('/sede/recuperacion');
      expect(component.isAuthPage).toBeTrue();

      updateRouteState('/sede/procedimientos');
      expect(component.isAuthPage).toBeFalse();
    });
  });

  // ─── Tour ──────────────────────────────────────────────────────────────────

  describe('Tour', () => {
    it('startTour should call guidedTourService.startCitizenTour', () => {
      Object.defineProperty(routerSpy, 'url', { value: '/sede/procedimientos', writable: true });

      component.startTour();

      expect(tourSpy.startCitizenTour).toHaveBeenCalledWith('/sede/procedimientos');
    });
  });

  // ─── Theme (continued) ─────────────────────────────────────────────────────

  describe('Theme (continued)', () => {
    it('applyTheme should remove class when isDark is false', () => {
      document.body.classList.add('theme-dark');
      spyOn(document.body.classList, 'remove');

      (component as any).applyTheme(false);

      expect(document.body.classList.remove).toHaveBeenCalledWith('theme-dark');
    });

    it('initTheme should not set dark mode when localStorage is light', () => {
      localStorage.setItem('tfg.theme', 'light');
      spyOn(document.body.classList, 'add');

      (component as any).initTheme();

      expect(component.isDarkMode).toBeFalse();
      expect(document.body.classList.add).not.toHaveBeenCalled();
    });
  });

  // ─── Escape / Keyboard (edge cases) ────────────────────────────────────────

  describe('Keyboard Edge Cases', () => {
    it('onEscapeKey should do nothing when menu is not open', () => {
      component.menuOpen = false;
      spyOn(component, 'closeMobileMenu');

      component.onEscapeKey();

      expect(component.closeMobileMenu).not.toHaveBeenCalled();
    });

    it('onGlobalKeydown should ignore when leftCtrl already pressed', () => {
      component.menuOpen = false;
      (component as any).leftCtrlPressed = true;
      const event = new KeyboardEvent('keydown', { code: 'ControlLeft' });

      component.onGlobalKeydown(event);
      // leftCtrlPressed stays true because the code returns after re-setting it
      expect((component as any).leftCtrlPressed).toBeTrue();
    });

    it('onGlobalKeydown should do nothing when key is non-alphanumeric', () => {
      (component as any).leftCtrlPressed = true;
      const event = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' });

      component.onGlobalKeydown(event);
      expect((component as any).typedHintBuffer).toBe('');
    });

    it('onGlobalKeydown should return early when key is invalid', () => {
      (component as any).leftCtrlPressed = true;
      const event = new KeyboardEvent('keydown', { key: '@' });

      component.onGlobalKeydown(event);
      expect((component as any).typedHintBuffer).toBe('');
    });

    it('onGlobalKeyup should do nothing when key is not ControlLeft', () => {
      (component as any).leftCtrlPressed = true;
      const event = new KeyboardEvent('keyup', { code: 'ShiftLeft' });

      component.onGlobalKeyup(event);
      expect((component as any).leftCtrlPressed).toBeTrue();
    });

    it('onViewportChange should return early when leftCtrl not pressed', () => {
      (component as any).leftCtrlPressed = false;
      component.onViewportChange();
      // No error, just returns
      expect((component as any).leftCtrlPressed).toBeFalse();
    });

    it('onViewportChange should return early when hintTargets is empty', () => {
      (component as any).leftCtrlPressed = true;
      (component as any).hintTargets = [];
      component.onViewportChange();
      expect((component as any).hintTargets.length).toBe(0);
    });

    it('normalizeHintKey should return null for special characters', () => {
      const result = (component as any).normalizeHintKey('@');
      expect(result).toBeNull();
    });

    it('normalizeHintKey should return key for valid alphanumeric', () => {
      const result = (component as any).normalizeHintKey('A');
      expect(result).toBe('a');
    });
  });

  // ─── Auth State ────────────────────────────────────────────────────────────

  describe('Auth State', () => {
    it('refreshAuthState should set label to Usuario when label is null', () => {
      authSpy.isAuthenticated.and.returnValue(true);
      authSpy.getAuthenticatedUserLabel.and.returnValue(null);

      (component as any).refreshAuthState();

      expect(component.authenticatedUserLabel).toBe('Usuario');
    });

    it('refreshAuthState should use label when provided', () => {
      authSpy.isAuthenticated.and.returnValue(true);
      authSpy.getAuthenticatedUserLabel.and.returnValue('Juan Perez');

      (component as any).refreshAuthState();

      expect(component.authenticatedUserLabel).toBe('Juan Perez');
    });

    it('loadUnreadMessageCount should call service when authenticated', () => {
      component.isAuthenticated = true;

      component.loadUnreadMessageCount();

      expect(messagesSpy.getUnreadCount).toHaveBeenCalled();
    });

    it('loadUnreadMessageCount should NOT call service when not authenticated', () => {
      component.isAuthenticated = false;

      component.loadUnreadMessageCount();

      expect(messagesSpy.getUnreadCount).not.toHaveBeenCalled();
    });
  });

  // ─── Keyboard Hints ────────────────────────────────────────────────────────

  describe('Keyboard Hints', () => {
    it('showKeyboardHints should return early when root not found', () => {
      const root = document.querySelector('app-public-layout');
      if (root) {
        root.remove();
      }

      (component as any).showKeyboardHints();

      expect((component as any).hintTargets.length).toBe(0);
    });

    it('hideKeyboardHints should clear targets', () => {
      (component as any).hintTargets = [{ hint: '1', element: document.createElement('div'), marker: document.createElement('span') }];
      spyOn(document, 'querySelector');

      (component as any).hideKeyboardHints();

      expect((component as any).hintTargets.length).toBe(0);
    });

    it('toHint should return correct hint for index 0', () => {
      const result = (component as any).toHint(0);
      expect(result).toBe('1');
    });

    it('toHint should return correct hint for index > alphabet length', () => {
      const result = (component as any).toHint(35);
      expect(result).toBe('11');
    });
  });

  // ─── isHintEligible ────────────────────────────────────────────────────────

  describe('isHintEligible', () => {
    it('should return false when element has data-keyboard-hint-ignore', () => {
      const el = document.createElement('button');
      el.setAttribute('data-keyboard-hint-ignore', 'true');
      expect((component as any).isHintEligible(el)).toBeFalse();
    });

    it('should return false when element is not visible', () => {
      const el = document.createElement('button');
      el.style.display = 'none';
      document.body.appendChild(el);
      expect((component as any).isHintEligible(el)).toBeFalse();
      document.body.removeChild(el);
    });

    it('should return false when element has no dimensions', () => {
      const el = document.createElement('button');
      el.style.position = 'absolute';
      el.style.width = '0';
      el.style.height = '0';
      document.body.appendChild(el);
      expect((component as any).isHintEligible(el)).toBeFalse();
      document.body.removeChild(el);
    });
  });

  // ─── Dropdown Focus ────────────────────────────────────────────────────────

  describe('Dropdown Focus (edge cases)', () => {
    it('onDropdownFocusOut should NOT close when focus stays in dropdown', () => {
      component.activeDropdown = 'PUBLIC.MENU_INFO';
      const mockElement = document.createElement('div');
      mockElement.classList.add('public-header__dropdown');
      const relatedTarget = document.createElement('span');
      mockElement.appendChild(relatedTarget);
      spyOn(relatedTarget, 'closest').and.returnValue(mockElement);
      const event = { relatedTarget } as unknown as FocusEvent;

      component.onDropdownFocusOut(event);

      expect(component.activeDropdown).toBe('PUBLIC.MENU_INFO');
    });
  });

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  describe('Cleanup', () => {
    it('ngOnDestroy should unsubscribe and unlock scroll', () => {
      spyOn(document.body.classList, 'remove');
      component.ngOnDestroy();

      expect(document.body.classList.remove).toHaveBeenCalledWith('mobile-menu-open');
    });
  });
});
