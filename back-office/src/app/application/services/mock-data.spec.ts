import { getPagedCases, mockCases } from './mock-data';

describe('Mock Data - getPagedCases', () => {

  describe('pagination', () => {
    it('should return first page with correct size', () => {
      const result = getPagedCases(0, 2);

      expect(result.items.length).toBe(2);
      expect(result.page).toBe(0);
      expect(result.size).toBe(2);
    });

    it('should return second page with correct items', () => {
      const result = getPagedCases(1, 2);

      expect(result.items.length).toBe(2);
      expect(result.page).toBe(1);
      expect(result.items[0].id).toBe(mockCases[2].id);
    });

    it('should return remaining items on last page', () => {
      const result = getPagedCases(2, 2);

      expect(result.items.length).toBe(2);
    });

    it('should return empty array when page is beyond total', () => {
      const result = getPagedCases(10, 2);

      expect(result.items.length).toBe(0);
    });

    it('should return all items when size exceeds total', () => {
      const result = getPagedCases(0, 100);

      expect(result.items.length).toBe(mockCases.length);
    });
  });

  describe('total calculation', () => {
    it('should calculate correct totalItems without filter', () => {
      const result = getPagedCases(0, 10);

      expect(result.totalItems).toBe(mockCases.length);
    });

    it('should calculate correct totalPages', () => {
      const result = getPagedCases(0, 2);

      expect(result.totalPages).toBe(3);
    });

    it('should round up totalPages for partial pages', () => {
      const result = getPagedCases(0, 4);

      expect(result.totalPages).toBe(2);
    });
  });

  describe('status filtering', () => {
    it('should filter by SUBMITTED status', () => {
      const result = getPagedCases(0, 10, 'SUBMITTED');

      expect(result.totalItems).toBe(1);
      expect(result.items[0].status).toBe('SUBMITTED');
    });

    it('should filter by IN_PROGRESS status', () => {
      const result = getPagedCases(0, 10, 'IN_PROGRESS');

      expect(result.totalItems).toBe(2);
      expect(result.items.every(c => c.status === 'IN_PROGRESS')).toBe(true);
    });

    it('should filter by PENDING_AMENDMENT status', () => {
      const result = getPagedCases(0, 10, 'PENDING_AMENDMENT');

      expect(result.totalItems).toBe(1);
      expect(result.items[0].status).toBe('PENDING_AMENDMENT');
    });

    it('should filter by DRAFT status', () => {
      const result = getPagedCases(0, 10, 'DRAFT');

      expect(result.totalItems).toBe(1);
      expect(result.items[0].status).toBe('DRAFT');
    });

    it('should filter by RESOLVED status', () => {
      const result = getPagedCases(0, 10, 'RESOLVED');

      expect(result.totalItems).toBe(1);
      expect(result.items[0].status).toBe('RESOLVED');
    });

    it('should return empty result for non-existent status', () => {
      const result = getPagedCases(0, 10, 'NON_EXISTENT');

      expect(result.totalItems).toBe(0);
      expect(result.items.length).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should apply pagination after filtering', () => {
      const result = getPagedCases(0, 1, 'IN_PROGRESS');

      expect(result.items.length).toBe(1);
      expect(result.totalItems).toBe(2);
      expect(result.totalPages).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle page 0 correctly', () => {
      const result = getPagedCases(0, 3);

      expect(result.page).toBe(0);
      expect(result.items.length).toBe(3);
    });

    it('should handle size of 1', () => {
      const result = getPagedCases(0, 1);

      expect(result.items.length).toBe(1);
      expect(result.totalPages).toBe(mockCases.length);
    });
  });
});
