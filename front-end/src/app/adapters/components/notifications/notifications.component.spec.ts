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
});
