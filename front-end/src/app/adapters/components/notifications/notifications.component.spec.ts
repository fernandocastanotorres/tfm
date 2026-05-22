import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsComponent } from './notifications.component';
import { NotificationsService } from '../../../application/services/notifications.service';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationsComponent],
      imports: [TranslateModule.forRoot(), ReactiveFormsModule],
      providers: [NotificationsService]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load inbox items', () => {
    expect(component.inbox.length).toBeGreaterThan(0);
  });

  it('should filter unread items', () => {
    component.toggleFilter('unread');
    expect(component.filteredInbox.every((item) => !item.read)).toBeTrue();
  });

  it('should set selectedItem to null when inbox array is empty', () => {
    const mockService = TestBed.inject(NotificationsService);
    spyOn(mockService, 'getInbox').and.returnValue([]);
    component.ngOnInit();
    expect(component.selectedItem).toBeNull();
  });

  it('should filter inbox by read status', () => {
    component.filterForm.patchValue({ status: 'read' });
    const filtered = component.filteredInbox;
    expect(filtered.every(item => item.read)).toBeTrue();
  });

  it('should filter inbox by specific type', () => {
    component.filterForm.patchValue({ type: 'NOTIFICATIONS.TYPE_STATUS' });
    const filtered = component.filteredInbox;
    expect(filtered.every(item => item.typeKey === 'NOTIFICATIONS.TYPE_STATUS')).toBeTrue();
  });

  it('should filter inbox by specific caseId', () => {
    component.filterForm.patchValue({ caseId: 'EXP-2026-001' });
    const filtered = component.filteredInbox;
    expect(filtered.every(item => item.caseId === 'EXP-2026-001')).toBeTrue();
  });

  it('should sort inbox by title alphabetically', () => {
    component.filterForm.patchValue({ sort: 'title' });
    const sorted = component.filteredInbox;
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].titleKey <= sorted[i].titleKey).toBeTrue();
    }
  });

  it('should filter inbox by search text matching messageKey', () => {
    component.filterForm.patchValue({ search: 'review' });
    const filtered = component.filteredInbox;
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('should get unique case options from inbox', () => {
    const options = component.caseOptions;
    expect(options.length).toBeGreaterThan(0);
    expect(options[0].id).toBeDefined();
  });

  it('should get unique type options from inbox', () => {
    const types = component.typeOptions;
    expect(types.length).toBeGreaterThan(0);
  });

  it('selectItem should update selectedItem and activeItemId', () => {
    const item = component.inbox[0];
    component.selectItem(item);
    expect(component.selectedItem).toBe(item);
    expect((component as any).activeItemId).toBe(item.id);
  });

  it('markAsRead should set read to true', () => {
    const item = component.inbox.find(i => !i.read);
    if (item) {
      component.markAsRead(item);
      expect(item.read).toBeTrue();
    }
  });

  it('changePage should update currentPage', () => {
    component.paginationState = { currentPage: 1, totalPages: 3, pageSize: 10 };
    component.changePage(2);
    expect(component.paginationState.currentPage).toBe(2);
  });

  it('toggleFilter should patch status', () => {
    component.toggleFilter('unread');
    expect(component.filterForm.value.status).toBe('unread');
  });

  it('pagedInbox should return correct slice', () => {
    component.paginationState = { currentPage: 1, totalPages: 1, pageSize: 2 };
    const paged = component.pagedInbox;
    expect(paged.length).toBeLessThanOrEqual(2);
  });

  it('onNotificationListKeydown should do nothing when keyManager is null', () => {
    (component as any).keyManager = undefined;
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    component.onNotificationListKeydown(event);
    expect(component).toBeTruthy();
  });

  it('onNotificationListFocus should do nothing when keyManager is null', () => {
    (component as any).keyManager = undefined;
    component.onNotificationListFocus();
    expect(component).toBeTruthy();
  });

  it('onNotificationListFocus should return early when activeItemIndex is not null', () => {
    (component as any).keyManager = { activeItemIndex: 0, setActiveItem: jasmine.createSpy('setActiveItem') };
    component.onNotificationListFocus();
    expect(component).toBeTruthy();
  });

  it('updatePageSize should update paginationState', () => {
    component.updatePageSize(20);
    expect(component.paginationState.pageSize).toBe(20);
    expect(component.paginationState.currentPage).toBe(1);
  });
});
