import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SecureHomeComponent } from './secure-home.component';

describe('SecureHomeComponent', () => {
  let component: SecureHomeComponent;
  let fixture: ComponentFixture<SecureHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot(), SecureHomeComponent],
    providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(SecureHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
