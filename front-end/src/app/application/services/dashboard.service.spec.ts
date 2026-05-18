import { TestBed } from '@angular/core/testing';
import { DashboardService, CaseItem, NotificationItem, QuickAccessItem } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardService]
    });
    service = TestBed.inject(DashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCases', () => {
    it('should return an array of CaseItem', () => {
      const cases = service.getCases();
      expect(Array.isArray(cases)).toBeTrue();
      expect(cases.length).toBeGreaterThan(0);
    });

    it('should return cases with required properties', () => {
      const cases = service.getCases();
      const caseItem = cases[0];

      expect(caseItem.id).toBeDefined();
      expect(caseItem.titleKey).toBeDefined();
      expect(caseItem.statusKey).toBeDefined();
      expect(caseItem.lastUpdated).toBeDefined();
      expect(caseItem.submittedAt).toBeDefined();
      expect(caseItem.categoryKey).toBeDefined();
      expect(caseItem.descriptionKey).toBeDefined();
      expect(caseItem.assignedUnitKey).toBeDefined();
    });

    it('should return cases with valid status values', () => {
      const cases = service.getCases();
      const validStatuses = ['CASE_STATUS.REVIEW', 'CASE_STATUS.PENDING', 'CASE_STATUS.APPROVED'];

      for (const caseItem of cases) {
        expect(validStatuses).toContain(caseItem.statusKey);
      }
    });

    it('should return cases with unique IDs', () => {
      const cases = service.getCases();
      const ids = cases.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should return cases with different statuses', () => {
      const cases = service.getCases();
      const statuses = cases.map(c => c.statusKey);
      expect(statuses).toContain('CASE_STATUS.REVIEW');
      expect(statuses).toContain('CASE_STATUS.PENDING');
      expect(statuses).toContain('CASE_STATUS.APPROVED');
    });

    it('should return consistent mock data on each call', () => {
      const cases1 = service.getCases();
      const cases2 = service.getCases();
      expect(cases1.length).toBe(cases2.length);
      expect(cases1[0].id).toBe(cases2[0].id);
    });
  });

  describe('getNotifications', () => {
    it('should return an array of NotificationItem', () => {
      const notifications = service.getNotifications();
      expect(Array.isArray(notifications)).toBeTrue();
      expect(notifications.length).toBeGreaterThan(0);
    });

    it('should return notifications with required properties', () => {
      const notifications = service.getNotifications();
      const notification = notifications[0];

      expect(notification.id).toBeDefined();
      expect(notification.messageKey).toBeDefined();
      expect(notification.date).toBeDefined();
    });

    it('should return notifications with unique IDs', () => {
      const notifications = service.getNotifications();
      const ids = notifications.map(n => n.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should return consistent mock data on each call', () => {
      const notifs1 = service.getNotifications();
      const notifs2 = service.getNotifications();
      expect(notifs1.length).toBe(notifs2.length);
      expect(notifs1[0].id).toBe(notifs2[0].id);
    });
  });

  describe('getQuickAccess', () => {
    it('should return an array of QuickAccessItem', () => {
      const quickAccess = service.getQuickAccess();
      expect(Array.isArray(quickAccess)).toBeTrue();
      expect(quickAccess.length).toBeGreaterThan(0);
    });

    it('should return items with required properties', () => {
      const quickAccess = service.getQuickAccess();
      const item = quickAccess[0];

      expect(item.id).toBeDefined();
      expect(item.titleKey).toBeDefined();
      expect(item.descriptionKey).toBeDefined();
      expect(item.route).toBeDefined();
    });

    it('should return items with valid routes starting with /', () => {
      const quickAccess = service.getQuickAccess();

      for (const item of quickAccess) {
        expect(item.route.startsWith('/')).toBeTrue();
      }
    });

    it('should return items with unique IDs', () => {
      const quickAccess = service.getQuickAccess();
      const ids = quickAccess.map(q => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should include common quick access routes', () => {
      const quickAccess = service.getQuickAccess();
      const routes = quickAccess.map(q => q.route);

      expect(routes).toContain('/sede/procedimientos');
    });

    it('should return consistent mock data on each call', () => {
      const qa1 = service.getQuickAccess();
      const qa2 = service.getQuickAccess();
      expect(qa1.length).toBe(qa2.length);
      expect(qa1[0].id).toBe(qa2[0].id);
    });
  });
});
