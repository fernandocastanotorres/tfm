import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SecureHomeComponent } from './secure-home.component';

describe('SecureHomeComponent', () => {
  let component: SecureHomeComponent;
  let fixture: ComponentFixture<SecureHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SecureHomeComponent],
      imports: [TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SecureHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
