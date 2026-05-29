import { Component, OnInit, inject } from '@angular/core';
import {
  AdminNotificationItem,
  CitizenCaseOption,
  CitizenOption,
  ElectronicNotificationService
} from '../../../application/services/electronic-notification.service';
import { ToastService } from '../../../application/services/toast.service';

@Component({
  selector: 'bo-electronic-notifications',
  templateUrl: './electronic-notifications.component.html',
  styleUrls: ['./electronic-notifications.component.css'],
  standalone: false
})
export class ElectronicNotificationsComponent implements OnInit {
  private readonly service = inject(ElectronicNotificationService);
  private readonly toast = inject(ToastService);

  readonly Math = Math;

  activeTab: 'send' | 'history' = 'send';

  filteredCitizens: CitizenOption[] = [];
  citizenCases: CitizenCaseOption[] = [];

  citizenSearch = '';
  selectedCitizenId = '';
  selectedCaseId = '';
  notificationType = 'FORMAL_NOTICE';
  subject = '';
  body = '';
  dueDays = 10;
  notifyByEmail = true;
  files: File[] = [];

  isLoadingCitizens = true;
  isLoadingCases = false;
  isSending = false;

  notifications: AdminNotificationItem[] = [];
  totalItems = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;
  historyStatusFilter = '';
  isLoadingHistory = false;

  readonly notificationTypes = [
    { key: 'FORMAL_NOTICE', label: 'Notificacion formal' },
    { key: 'REQUEST_INFO', label: 'Requerimiento de informacion' },
    { key: 'AMENDMENT_REQUIRED', label: 'Requerimiento de subsanacion' },
    { key: 'RESOLUTION_NOTICE', label: 'Comunicacion de resolucion' }
  ];

  readonly statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'AVAILABLE', label: 'Disponible' },
    { value: 'ACCESSED', label: 'Accedida' },
    { value: 'ACCEPTED', label: 'Aceptada' },
    { value: 'REJECTED', label: 'Rechazada' },
    { value: 'EXPIRED', label: 'Caducada' }
  ];

  ngOnInit(): void {
    this.loadCitizens();
  }

  setActiveTab(tab: 'send' | 'history'): void {
    this.activeTab = tab;
    if (tab === 'history' && this.notifications.length === 0) {
      this.loadHistory();
    }
  }

  loadCitizens(): void {
    this.applyCitizenFilter();
  }

  applyCitizenFilter(): void {
    const term = this.citizenSearch.trim();
    this.isLoadingCitizens = true;
    this.service.listCitizens(term).subscribe({
      next: (citizens) => {
        this.filteredCitizens = citizens;
        this.isLoadingCitizens = false;
      },
      error: () => {
        this.isLoadingCitizens = false;
        this.toast.error('Notificaciones', 'No se pudo filtrar el listado de ciudadanos.');
      }
    });
  }

  selectCitizen(citizenId: string): void {
    if (!citizenId) {
      this.selectedCitizenId = '';
      this.selectedCaseId = '';
      this.citizenCases = [];
      return;
    }

    this.selectedCitizenId = citizenId;
    this.selectedCaseId = '';
    this.isLoadingCases = true;
    this.service.listCitizenCases(citizenId).subscribe({
      next: (items) => {
        this.citizenCases = items;
        this.isLoadingCases = false;
      },
      error: () => {
        this.citizenCases = [];
        this.isLoadingCases = false;
        this.toast.error('Notificaciones', 'No se pudo cargar el historial del ciudadano.');
      }
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.files = input.files ? Array.from(input.files) : [];
  }

  send(): void {
    if (!this.selectedCitizenId || !this.selectedCaseId) {
      this.toast.warning('Notificaciones', 'Selecciona un ciudadano y un expediente.');
      return;
    }
    if (!this.body.trim()) {
      this.toast.warning('Notificaciones', 'El contenido de la notificacion es obligatorio.');
      return;
    }

    this.isSending = true;
    this.service.sendFormalNotification(
      this.selectedCitizenId,
      this.selectedCaseId,
      this.notificationType,
      this.subject.trim() || 'Notificacion electronica',
      this.body.trim(),
      this.dueDays,
      this.notifyByEmail,
      this.files
    ).subscribe({
      next: () => {
        this.isSending = false;
        this.subject = '';
        this.body = '';
        this.files = [];
        this.toast.success('Notificaciones', 'Notificacion electronica enviada correctamente.');
      },
      error: () => {
        this.isSending = false;
        this.toast.error('Notificaciones', 'No se pudo enviar la notificacion electronica.');
      }
    });
  }

  loadHistory(): void {
    this.isLoadingHistory = true;
    this.service.listAllNotifications(
      this.currentPage, this.pageSize, this.historyStatusFilter || undefined
    ).subscribe({
      next: (page) => {
        this.notifications = page.items;
        this.totalItems = page.totalItems;
        this.totalPages = page.totalPages;
        this.isLoadingHistory = false;
      },
      error: () => {
        this.notifications = [];
        this.isLoadingHistory = false;
        this.toast.error('Notificaciones', 'No se pudo cargar el historial.');
      }
    });
  }

  onHistoryStatusFilterChange(status: string): void {
    this.historyStatusFilter = status;
    this.currentPage = 0;
    this.loadHistory();
  }

  changeHistoryPage(page: number): void {
    this.currentPage = page;
    this.loadHistory();
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      AVAILABLE: 'bg-blue-100 text-blue-800',
      ACCESSED: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(o => o.value === status);
    return option?.label || status;
  }
}
