import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessagesComponent } from './messages.component';
import { MessagesService } from '../../../application/services/messages.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

describe('MessagesComponent', () => {
  let component: MessagesComponent;
  let fixture: ComponentFixture<MessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MessagesComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [MessagesService]
    }).compileComponents();

    fixture = TestBed.createComponent(MessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load message threads', () => {
    expect(component.threads.length).toBeGreaterThan(0);
  });

  it('should clear reply after send', () => {
    component.reply = 'test';
    component.sendReply();
    expect(component.reply).toBe('');
  });
});
