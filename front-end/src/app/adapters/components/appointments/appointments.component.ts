import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AppointmentsService, AppointmentItem } from '../../../application/services/appointments.service';
import { changePage, updatePageSize, getPaginationState, PaginationState } from '../../../application/utils/pagination';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: []
})
export class AppointmentsComponent implements OnInit {
  appointments: AppointmentItem[] = [];
  readonly paginationOptions = [10, 20, 50];
  paginationState: PaginationState = { currentPage: 1, totalPages: 1, pageSize: 10 };
  slots = ['09:00', '10:30', '12:00', '16:00'];
  selectedSlot = '';

  readonly filterForm = this.fb.group({
    search: [''],
    status: ['all'],
    type: ['all'],
    caseId: ['all'],
    sort: ['date'],
    pageSize: [10]
  });

  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.appointments = this.appointmentsService.getAppointments();
    this.updatePaginationState();
  }

  get filteredAppointments(): AppointmentItem[] {
    const search = (this.filterForm.value.search ?? '').toString().toLowerCase();
    const status = this.filterForm.value.status ?? 'all';
    const type = this.filterForm.value.type ?? 'all';
    const caseId = this.filterForm.value.caseId ?? 'all';
    const sort = this.filterForm.value.sort ?? 'date';

    let items = this.appointments.filter((appt) => {
      const matchesSearch =
        appt.serviceKey.toLowerCase().includes(search) ||
        appt.caseId.toLowerCase().includes(search) ||
        appt.caseTitleKey.toLowerCase().includes(search) ||
        appt.locationKey.toLowerCase().includes(search);
      const matchesStatus = status === 'all' || appt.statusKey === status;
      const matchesType = type === 'all' || appt.typeKey === type;
      const matchesCase = caseId === 'all' || appt.caseId === caseId;
      return matchesSearch && matchesStatus && matchesType && matchesCase;
    });

    items = items.sort((a, b) => {
      if (sort === 'time') {
        return a.time.localeCompare(b.time);
      }
      return a.date.localeCompare(b.date);
    });

    return items;
  }

  get pagedAppointments(): AppointmentItem[] {
    const start = (this.paginationState.currentPage - 1) * this.paginationState.pageSize;
    return this.filteredAppointments.slice(start, start + this.paginationState.pageSize);
  }

  get caseOptions(): { id: string; labelKey: string }[] {
    const uniqueCases = new Map<string, string>();
    this.appointments.forEach((appt) => {
      if (!uniqueCases.has(appt.caseId)) {
        uniqueCases.set(appt.caseId, appt.caseTitleKey);
      }
    });
    return Array.from(uniqueCases.entries()).map(([id, labelKey]) => ({ id, labelKey }));
  }

  get typeOptions(): string[] {
    return Array.from(new Set(this.appointments.map((appt) => appt.typeKey)));
  }

  selectSlot(slot: string): void {
    this.selectedSlot = slot;
  }

  toggleFilter(filter: 'all' | 'confirmed' | 'pending'): void {
    this.filterForm.patchValue({ status: filter });
    this.paginationState = updatePageSize(this.filterForm, this.paginationState.pageSize, this.paginationState);
    this.updatePaginationState();
  }

  changePage(page: number): void {
    this.paginationState = changePage(page, this.paginationState);
  }

  updatePageSize(size: number): void {
    this.paginationState = updatePageSize(this.filterForm, size, this.paginationState);
    this.updatePaginationState();
  }

  private updatePaginationState(): void {
    this.paginationState = getPaginationState(this.filteredAppointments.length, this.filterForm);
  }
}
