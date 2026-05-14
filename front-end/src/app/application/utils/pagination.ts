import { FormGroup } from '@angular/forms';

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export function getPaginationState(
  totalItems: number,
  filterForm: FormGroup
): PaginationState {
  const pageSize = Number(filterForm.value.pageSize) || 10;
  const currentPage = 1;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return { currentPage, totalPages, pageSize };
}

export function updatePageSize(
  filterForm: FormGroup,
  size: number,
  state: PaginationState
): PaginationState {
  filterForm.patchValue({ pageSize: Number(size) });
  return { ...state, currentPage: 1, pageSize: Number(size) };
}

export function changePage(
  page: number,
  state: PaginationState
): PaginationState {
  const newPage = Math.min(Math.max(page, 1), state.totalPages);
  return { ...state, currentPage: newPage };
}
