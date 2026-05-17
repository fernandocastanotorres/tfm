import { Component, OnInit, inject } from '@angular/core';
import { BackofficeUser, CreateUserRequest, UpdateUserRequest } from '../../../application/models/backoffice.models';
import { UserManagementService } from '../../../application/services/user-management.service';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';

@Component({
  selector: 'bo-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  private readonly userManagementService = inject(UserManagementService);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  users: BackofficeUser[] = [];
  selectedUser: BackofficeUser | null = null;
  searchTerm = '';
  isLoading = true;
  isSaving = false;
  showForm = false;

  form = {
    email: '',
    password: '',
    roles: ['ROLE_TRAMITADOR'],
    isActive: true
  };

  roleOptions = [
    { value: 'ROLE_TRAMITADOR', label: 'Tramitador' },
    { value: 'ROLE_ADMIN', label: 'Administrador' }
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  get filteredUsers(): BackofficeUser[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.users;
    return this.users.filter(user => user.email.toLowerCase().includes(term) || user.roles.join(' ').toLowerCase().includes(term));
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userManagementService.list().subscribe({
      next: users => {
        this.users = users;
        this.isLoading = false;
      },
      error: () => {
        this.users = [];
        this.isLoading = false;
      }
    });
  }

  openCreate(): void {
    this.selectedUser = null;
    this.form = { email: '', password: '', roles: ['ROLE_TRAMITADOR'], isActive: true };
    this.showForm = true;
  }

  openEdit(user: BackofficeUser): void {
    this.selectedUser = user;
    this.form = { email: user.email, password: '', roles: [...user.roles], isActive: user.isActive };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedUser = null;
  }

  toggleRole(role: string): void {
    if (this.form.roles.includes(role)) {
      this.form.roles = this.form.roles.filter(item => item !== role);
      return;
    }
    this.form.roles = [...this.form.roles, role];
  }

  async save(): Promise<void> {
    if (!this.form.email || this.form.roles.length === 0) return;

    const confirmed = await this.confirmDialogService.confirm('Confirmar guardado', 'Se aplicaran los cambios del usuario de backoffice.', 'Si, guardar');
    if (!confirmed) return;

    this.isSaving = true;
    if (this.selectedUser) {
      const request: UpdateUserRequest = {
        email: this.form.email,
        roles: this.form.roles,
        isActive: this.form.isActive
      };
      this.userManagementService.update(this.selectedUser.id, request).subscribe({
        next: () => this.afterSave(),
        error: () => this.isSaving = false
      });
      return;
    }

    const request: CreateUserRequest = {
      email: this.form.email,
      password: this.form.password || 'ChangeMe123',
      roles: this.form.roles,
      isActive: this.form.isActive
    };
    this.userManagementService.create(request).subscribe({
      next: () => this.afterSave(),
      error: () => this.isSaving = false
    });
  }

  async toggleActive(user: BackofficeUser): Promise<void> {
    const action = user.isActive ? 'desactivar' : 'activar';
    const confirmed = await this.confirmDialogService.confirm('Confirmar accion', `Vas a ${action} este usuario.`, 'Si, continuar');
    if (!confirmed) return;
    this.userManagementService.toggleActive(user.id, !user.isActive).subscribe({
      next: updated => user.isActive = updated.isActive
    });
  }

  private afterSave(): void {
    this.isSaving = false;
    this.closeForm();
    this.loadUsers();
  }
}
