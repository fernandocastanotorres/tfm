import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../application/services/auth.service';
import { GuidedTourService } from '../../../application/services/guided-tour.service';
import { MessagingAdminService, UnreadCounts, UnreadThreadSummary } from '../../../application/services/messaging-admin.service';
import { ContactInboxService } from '../../../application/services/contact-inbox.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
    selector: 'bo-backoffice-layout',
    templateUrl: './backoffice-layout.component.html',
    styleUrls: ['./backoffice-layout.component.css'],
    standalone: false
})
export class BackofficeLayoutComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly guidedTourService = inject(GuidedTourService);
  private readonly messagingService = inject(MessagingAdminService);
  private readonly contactInboxService = inject(ContactInboxService);

  username = '';
  userRoles: string[] = [];
  sidebarOpen = true;
  unreadCounts: UnreadCounts = { citizenUnread: 0, adminUnread: 0 };
  unreadThreads: UnreadThreadSummary[] = [];
  unreadContactCount = 0;
  messagesDropdownOpen = false;
  private unreadPollSub?: Subscription;

  navItems: NavItem[] = [
    { label: 'Panel Principal', icon: 'dashboard', route: '/dashboard' },
    { label: 'Estadisticas', icon: 'chart', route: '/statistics' },
    { label: 'Expedientes', icon: 'folder', route: '/cases' },
    { label: 'Tareas Pendientes', icon: 'task', route: '/tasks' },
    { label: 'Buzon de Contacto', icon: 'inbox', route: '/contact-inbox' },
    { label: 'Usuarios', icon: 'people', route: '/admin/users', roles: ['ROLE_ADMIN'] },
    { label: 'Procedimientos', icon: 'settings', route: '/admin/procedures', roles: ['ROLE_ADMIN'] },
    { label: 'Contenido Publico', icon: 'public', route: '/admin/public-content', roles: ['ROLE_ADMIN'] },
    { label: 'Transparencia', icon: 'transparency', route: '/admin/transparency', roles: ['ROLE_ADMIN'] }
  ];

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.username = user.email;
      this.userRoles = user.roles;
    }
    this.loadUnreadCounts();
    this.unreadPollSub = interval(30000)
      .pipe(switchMap(() => this.messagingService.getUnreadCounts()))
      .subscribe({
        next: (counts) => { this.unreadCounts = counts; },
        error: () => {}
      });
    interval(60000)
      .pipe(switchMap(() => this.contactInboxService.getUnreadCount()))
      .subscribe({
        next: (count) => { this.unreadContactCount = count; },
        error: () => {}
      });
  }

  ngOnDestroy(): void {
    this.unreadPollSub?.unsubscribe();
  }

  loadUnreadCounts(): void {
    this.messagingService.getUnreadCounts().subscribe({
      next: (counts) => { this.unreadCounts = counts; },
      error: () => {}
    });
    this.messagingService.getUnreadThreadSummaries().subscribe({
      next: (threads) => { this.unreadThreads = threads; },
      error: () => { this.unreadThreads = []; }
    });
  }

  toggleMessagesDropdown(): void {
    this.messagesDropdownOpen = !this.messagesDropdownOpen;
    if (this.messagesDropdownOpen && this.unreadThreads.length === 0) {
      this.loadUnreadThreads();
    }
  }

  loadUnreadThreads(): void {
    this.messagingService.getUnreadThreadSummaries().subscribe({
      next: (threads) => { this.unreadThreads = threads; },
      error: () => { this.unreadThreads = []; }
    });
  }

  closeMessagesDropdown(): void {
    this.messagesDropdownOpen = false;
  }

  navigateToCaseMessages(caseId: string): void {
    this.closeMessagesDropdown();
    this.router.navigate(['/cases', caseId], { queryParams: { tab: 'messages' } });
  }

  navigateToCases(): void {
    this.closeMessagesDropdown();
    this.router.navigate(['/cases']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  isVisible(item: NavItem): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some(role => this.userRoles.includes(role));
  }

  getIcon(icon: string): string {
    const icons: Record<string, string> = {
      dashboard: '📊',
      chart: '📈',
      folder: '📁',
      task: '✅',
      inbox: '📬',
      people: '👥',
      settings: '⚙️',
      public: '🌐',
      transparency: '📋'
    };
    return icons[icon] || '📄';
  }

  getPageTitle(): string {
    const currentRoute = this.router.url;
    const item = this.navItems.find(n => currentRoute.startsWith(n.route));
    return item?.label || 'Backoffice';
  }

  startTour(): void {
    this.guidedTourService.startBackofficeTour();
  }
}
