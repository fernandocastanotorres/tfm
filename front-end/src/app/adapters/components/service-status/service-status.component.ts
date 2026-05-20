import { Component, OnInit } from '@angular/core';
import { ServiceStatusService } from '../../../application/services/service-status.service';
import { ServiceStatusItem } from '../../../application/models/sede.models';

@Component({
    selector: 'app-service-status',
    templateUrl: './service-status.component.html',
    styleUrls: ['./service-status.component.css'],
    standalone: false
})
export class ServiceStatusComponent implements OnInit {
  services: ServiceStatusItem[] = [];
  isLoading = true;
  operationalCount = 0;

  constructor(private readonly serviceStatusService: ServiceStatusService) {}

  ngOnInit(): void {
    this.serviceStatusService.getAllStatus().subscribe({
      next: (data) => {
        this.services = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
    this.serviceStatusService.getOperationalCount().subscribe((count) => {
      this.operationalCount = count;
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'operational': 'SERVICE_STATUS.STATUS_OPERATIONAL',
      'degraded': 'SERVICE_STATUS.STATUS_DEGRADED',
      'down': 'SERVICE_STATUS.STATUS_DOWN',
      'maintenance': 'SERVICE_STATUS.STATUS_MAINTENANCE'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'operational': 'service-status__indicator--operational',
      'degraded': 'service-status__indicator--degraded',
      'down': 'service-status__indicator--down',
      'maintenance': 'service-status__indicator--maintenance'
    };
    return classes[status] || '';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
