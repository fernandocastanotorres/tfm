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
});
