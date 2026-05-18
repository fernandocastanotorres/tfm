import { getPaginationState, updatePageSize, changePage, PaginationState } from './pagination';
import { FormGroup, FormControl } from '@angular/forms';

function createFilterForm(pageSize: number = 10): FormGroup {
  return new FormGroup({
    pageSize: new FormControl(pageSize)
  });
}

describe('Pagination Utils', () => {

  describe('getPaginationState', () => {
    it('should calculate correct state with default page size', () => {
      const form = createFilterForm(10);
      const state = getPaginationState(45, form);

      expect(state.currentPage).toBe(1);
      expect(state.totalPages).toBe(5);
      expect(state.pageSize).toBe(10);
    });

    it('should calculate correct state with custom page size', () => {
      const form = createFilterForm(25);
      const state = getPaginationState(100, form);

      expect(state.currentPage).toBe(1);
      expect(state.totalPages).toBe(4);
      expect(state.pageSize).toBe(25);
    });

    it('should return at least 1 total page when no items', () => {
      const form = createFilterForm(10);
      const state = getPaginationState(0, form);

      expect(state.totalPages).toBe(1);
    });

    it('should use default page size 10 when form value is null', () => {
      const form = new FormGroup({
        pageSize: new FormControl(null)
      });
      const state = getPaginationState(30, form);

      expect(state.pageSize).toBe(10);
      expect(state.totalPages).toBe(3);
    });

    it('should handle exact division correctly', () => {
      const form = createFilterForm(10);
      const state = getPaginationState(50, form);

      expect(state.totalPages).toBe(5);
    });

    it('should round up for partial pages', () => {
      const form = createFilterForm(10);
      const state = getPaginationState(51, form);

      expect(state.totalPages).toBe(6);
    });
  });

  describe('updatePageSize', () => {
    it('should update page size and reset to page 1', () => {
      const form = createFilterForm(10);
      const initialState: PaginationState = { currentPage: 3, totalPages: 5, pageSize: 10 };

      const newState = updatePageSize(form, 25, initialState);

      expect(newState.pageSize).toBe(25);
      expect(newState.currentPage).toBe(1);
      expect(newState.totalPages).toBe(5);
      expect(form.value.pageSize).toBe(25);
    });

    it('should convert string size to number', () => {
      const form = createFilterForm(10);
      const initialState: PaginationState = { currentPage: 2, totalPages: 4, pageSize: 10 };

      const newState = updatePageSize(form, 50, initialState);

      expect(newState.pageSize).toBe(50);
    });
  });

  describe('changePage', () => {
    it('should navigate to the requested page', () => {
      const state: PaginationState = { currentPage: 1, totalPages: 5, pageSize: 10 };

      const newState = changePage(3, state);

      expect(newState.currentPage).toBe(3);
      expect(newState.totalPages).toBe(5);
      expect(newState.pageSize).toBe(10);
    });

    it('should not go below page 1', () => {
      const state: PaginationState = { currentPage: 2, totalPages: 5, pageSize: 10 };

      const newState = changePage(0, state);

      expect(newState.currentPage).toBe(1);
    });

    it('should not go below page 1 with negative input', () => {
      const state: PaginationState = { currentPage: 2, totalPages: 5, pageSize: 10 };

      const newState = changePage(-5, state);

      expect(newState.currentPage).toBe(1);
    });

    it('should not go above total pages', () => {
      const state: PaginationState = { currentPage: 2, totalPages: 5, pageSize: 10 };

      const newState = changePage(10, state);

      expect(newState.currentPage).toBe(5);
    });

    it('should handle page equal to total pages', () => {
      const state: PaginationState = { currentPage: 1, totalPages: 3, pageSize: 10 };

      const newState = changePage(3, state);

      expect(newState.currentPage).toBe(3);
    });

    it('should preserve other state properties', () => {
      const state: PaginationState = { currentPage: 1, totalPages: 5, pageSize: 25 };

      const newState = changePage(2, state);

      expect(newState.totalPages).toBe(5);
      expect(newState.pageSize).toBe(25);
    });
  });
});
