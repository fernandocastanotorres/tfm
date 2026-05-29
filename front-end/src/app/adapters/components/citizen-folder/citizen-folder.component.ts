import { Component, OnInit } from '@angular/core';
import { CaseItem } from '../../../application/models/case.models';
import { CasesApiService } from '../../../application/services/cases-api.service';
import { MessagesService } from '../../../application/services/messages.service';
import { NotificationsService } from '../../../application/services/notifications.service';
import { AppointmentsService } from '../../../application/services/appointments.service';
import { PaymentsService } from '../../../application/services/payments.service';
import { NotificationInboxItem } from '../../../application/models/notification.models';
import { ToastService } from '../../../application/services/toast.service';
import { trackByIndex } from '../../../application/utils/track-by.utils';
import jsPDF from 'jspdf';
import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

type TimelineType = 'CASE' | 'MESSAGE' | 'PAYMENT' | 'APPOINTMENT';
type TimelinePriority = 'HIGH' | 'MEDIUM' | 'LOW';

interface TimelineEvent {
  id: string;
  type: TimelineType;
  title: string;
  detail: string;
  date: Date;
  priority: TimelinePriority;
  route: string;
}

@Component({
    selector: 'app-citizen-folder',
    templateUrl: './citizen-folder.component.html',
    styleUrls: ['./citizen-folder.component.css'],
    imports: [NgIf, NgFor, RouterLink, FormsModule, NgClass, DatePipe, TranslateModule]
})
export class CitizenFolderComponent implements OnInit {
  isLoading = true;
  cases: CaseItem[] = [];
  unreadMessages = 0;
  pendingPayments = 0;
  pendingAppointments = 0;
  latestNotification: NotificationInboxItem | null = null;
  timelineEvents: TimelineEvent[] = [];

  timelineTypeFilter: 'all' | TimelineType = 'all';
  timelinePriorityFilter: 'all' | TimelinePriority = 'all';
  timelinePeriodFilter: '7d' | '30d' | 'all' = '30d';
  timelineSort: 'date_desc' | 'date_asc' | 'priority_desc' | 'priority_asc' = 'date_desc';
  timelinePage = 1;
  timelinePageSize = 8;

  protected readonly trackByIndex = trackByIndex;

  constructor(
    private readonly casesApi: CasesApiService,
    private readonly messagesService: MessagesService,
    private readonly notificationsService: NotificationsService,
    private readonly appointmentsService: AppointmentsService,
    private readonly paymentsService: PaymentsService,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCases();
    this.loadUnreadMessages();
    this.loadLatestNotification();
    const payments = this.paymentsService.getPayments();
    const appointments = this.appointmentsService.getAppointments();
    this.pendingPayments = payments.filter((item) => item.statusKey === 'PAYMENT_STATUS.PENDING').length;
    this.pendingAppointments = appointments.filter((item) => item.statusKey === 'APPOINTMENT_STATUS.PENDING').length;
    this.timelineEvents = [
      ...this.mapPaymentEvents(payments),
      ...this.mapAppointmentEvents(appointments)
    ];
  }

  private loadCases(): void {
    this.casesApi.list(0, 10).subscribe({
      next: (response) => {
        this.cases = response.items;
        this.timelineEvents = [...this.timelineEvents, ...this.mapCaseEvents(response.items)]
          .sort((a, b) => b.date.getTime() - a.date.getTime());
        this.isLoading = false;
      },
      error: (err) => {
        this.toast.error('Error al cargar', err?.error?.message ?? 'No se pudo cargar la carpeta ciudadana.');
        this.isLoading = false;
      }
    });
  }

  private loadUnreadMessages(): void {
    this.messagesService.getUnreadCount().subscribe({
      next: (count) => {
        this.unreadMessages = count;
      },
      error: () => {
        this.unreadMessages = 0;
      }
    });
  }

  private loadLatestNotification(): void {
    this.notificationsService.getInbox().subscribe({
      next: (items) => {
        this.latestNotification = items.length > 0 ? items[0] : null;
        this.timelineEvents = [...this.timelineEvents, ...this.mapMessageEvents(items)]
          .sort((a, b) => b.date.getTime() - a.date.getTime());
      },
      error: () => {
        this.latestNotification = null;
      }
    });
  }

  get filteredTimelineEvents(): TimelineEvent[] {
    const now = new Date();
    let days: number | null = null;
    if (this.timelinePeriodFilter === '7d') {
      days = 7;
    } else if (this.timelinePeriodFilter === '30d') {
      days = 30;
    }

    const filtered = this.timelineEvents.filter((event) => {
      const byType = this.timelineTypeFilter === 'all' || event.type === this.timelineTypeFilter;
      const byPriority = this.timelinePriorityFilter === 'all' || event.priority === this.timelinePriorityFilter;
      const byPeriod = days === null || ((now.getTime() - event.date.getTime()) / (1000 * 60 * 60 * 24)) <= days;
      return byType && byPriority && byPeriod;
    });

    return filtered.sort((a, b) => this.compareEvents(a, b));
  }

  get pagedTimelineEvents(): TimelineEvent[] {
    const start = (this.timelinePage - 1) * this.timelinePageSize;
    return this.filteredTimelineEvents.slice(start, start + this.timelinePageSize);
  }

  get timelineTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTimelineEvents.length / this.timelinePageSize));
  }

  onTimelineFilterChange(): void {
    this.timelinePage = 1;
  }

  changeTimelinePage(page: number): void {
    if (page < 1 || page > this.timelineTotalPages) {
      return;
    }
    this.timelinePage = page;
  }

  exportFolderPdf(): void {
    const doc = new jsPDF();
    const now = new Date();

    doc.setFontSize(16);
    doc.text('Carpeta Ciudadana - Resumen', 14, 18);
    doc.setFontSize(10);
    doc.text(`Fecha: ${now.toLocaleString('es-ES')}`, 14, 24);

    doc.setFontSize(12);
    doc.text('Indicadores', 14, 34);
    doc.setFontSize(10);
    doc.text(`Expedientes: ${this.cases.length}`, 14, 40);
    doc.text(`Mensajes no leidos: ${this.unreadMessages}`, 14, 46);
    doc.text(`Pagos pendientes: ${this.pendingPayments}`, 14, 52);
    doc.text(`Citas pendientes: ${this.pendingAppointments}`, 14, 58);

    doc.setFontSize(12);
    doc.text('Timeline unificado (primeros 12 eventos)', 14, 70);
    doc.setFontSize(9);

    const events = this.filteredTimelineEvents.slice(0, 12);
    let y = 76;
    events.forEach((event, index) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      const line = `${index + 1}. [${this.typeLabel(event.type)}|${event.priority}] ${event.date.toLocaleString('es-ES')} - ${event.title}`;
      doc.text(line, 14, y);
      y += 6;
    });

    doc.save(`carpeta-ciudadana-${now.toISOString().slice(0, 10)}.pdf`);
  }

  priorityClass(priority: TimelinePriority): string {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-700';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }

  typeLabel(type: TimelineType): string {
    switch (type) {
      case 'CASE':
        return 'Expediente';
      case 'MESSAGE':
        return 'Mensaje';
      case 'PAYMENT':
        return 'Pago';
      default:
        return 'Cita';
    }
  }

  private mapCaseEvents(items: CaseItem[]): TimelineEvent[] {
    return items.map((item) => ({
      id: `case-${item.id}`,
      type: 'CASE',
      title: item.title,
      detail: `Estado: ${item.status}`,
      date: new Date(item.lastUpdated || item.createdAt),
      priority: this.casePriority(item.status),
      route: `/sede/expedientes/${item.id}/detalle`
    }));
  }

  private mapMessageEvents(items: NotificationInboxItem[]): TimelineEvent[] {
    return items.map((item) => ({
      id: `msg-${item.id}`,
      type: 'MESSAGE',
      title: item.title,
      detail: item.message,
      date: new Date(item.date),
      priority: item.read ? 'LOW' : 'HIGH',
      route: '/sede/mensajes'
    }));
  }

  private mapPaymentEvents(items: ReturnType<PaymentsService['getPayments']>): TimelineEvent[] {
    return items.map((item) => ({
      id: `pay-${item.id}`,
      type: 'PAYMENT',
      title: item.conceptKey,
      detail: `${item.amountLabel} · vencimiento ${item.dueDate}`,
      date: this.parseLocalDate(item.dueDate),
      priority: item.statusKey === 'PAYMENT_STATUS.PENDING' ? 'HIGH' : 'LOW',
      route: '/sede/pagos'
    }));
  }

  private mapAppointmentEvents(items: ReturnType<AppointmentsService['getAppointments']>): TimelineEvent[] {
    return items.map((item) => ({
      id: `app-${item.id}`,
      type: 'APPOINTMENT',
      title: item.serviceKey,
      detail: `${item.date} ${item.time}`,
      date: this.parseLocalDateTime(item.date, item.time),
      priority: item.statusKey === 'APPOINTMENT_STATUS.PENDING' ? 'MEDIUM' : 'LOW',
      route: '/sede/citas'
    }));
  }

  private casePriority(status: string): TimelinePriority {
    const key = (status ?? '').toUpperCase();
    if (key.includes('AMENDMENT') || key.includes('SUBSAN')) {
      return 'HIGH';
    }
    if (key.includes('PENDING') || key.includes('REVIEW')) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  private parseLocalDate(raw: string): Date {
    const [day, month, year] = raw.split('/').map((value) => Number(value));
    return new Date(year, month - 1, day, 9, 0, 0, 0);
  }

  private parseLocalDateTime(rawDate: string, rawTime: string): Date {
    const [day, month, year] = rawDate.split('/').map((value) => Number(value));
    const [hour, minute] = rawTime.split(':').map((value) => Number(value));
    return new Date(year, month - 1, day, hour, minute, 0, 0);
  }

  private compareEvents(a: TimelineEvent, b: TimelineEvent): number {
    if (this.timelineSort === 'date_asc') {
      return a.date.getTime() - b.date.getTime();
    }
    if (this.timelineSort === 'date_desc') {
      return b.date.getTime() - a.date.getTime();
    }

    const pa = this.priorityWeight(a.priority);
    const pb = this.priorityWeight(b.priority);
    if (this.timelineSort === 'priority_asc') {
      return pa - pb || b.date.getTime() - a.date.getTime();
    }
    return pb - pa || b.date.getTime() - a.date.getTime();
  }

  private priorityWeight(priority: TimelinePriority): number {
    if (priority === 'HIGH') {
      return 3;
    }
    if (priority === 'MEDIUM') {
      return 2;
    }
    return 1;
  }
}
