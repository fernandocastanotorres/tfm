import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../application/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'bo-backoffice-layout',
  templateUrl: './backoffice-layout.component.html',
  styleUrls: ['./backoffice-layout.component.css']
})
export class BackofficeLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  userRoles: string[] = [];
  sidebarOpen = true;

  navItems: NavItem[] = [
    { label: 'Panel Principal', icon: 'dashboard', route: '/dashboard' },
    { label: 'Expedientes', icon: 'folder', route: '/cases' },
    { label: 'Tareas Pendientes', icon: 'task', route: '/tasks' },
    { label: 'Usuarios', icon: 'people', route: '/admin/users', roles: ['ROLE_ADMIN'] },
    { label: 'Procedimientos', icon: 'settings', route: '/admin/procedures', roles: ['ROLE_ADMIN'] }
  ];

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.username = user.email;
      this.userRoles = user.roles;
    }
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
      folder: '📁',
      task: '✅',
      people: '👥',
      settings: '⚙️'
    };
    return icons[icon] || '📄';
  }

  getPageTitle(): string {
    const currentRoute = this.router.url;
    const item = this.navItems.find(n => currentRoute.startsWith(n.route));
    return item?.label || 'Backoffice';
  }
}
