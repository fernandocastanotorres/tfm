import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactComponent } from './contact.component';
import { ContactService } from '../../../application/services/contact.service';
import { of } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let contactService: jasmine.SpyObj<ContactService>;

  const mockOffices = [
    { id: '1', nameKey: 'CONTACT.OFFICE_MAIN_NAME', addressKey: 'CONTACT.OFFICE_MAIN_ADDRESS', phone: '912345678', email: 'main@office.es', scheduleKey: 'CONTACT.OFFICE_MAIN_SCHEDULE' },
    { id: '2', nameKey: 'CONTACT.OFFICE_BRANCH_NAME', addressKey: 'CONTACT.OFFICE_BRANCH_ADDRESS', phone: '912345679', email: 'branch@office.es', scheduleKey: 'CONTACT.OFFICE_BRANCH_SCHEDULE' }
  ];

  const mockChannels = [
    { id: '1', nameKey: 'CONTACT.CHANNEL_PHONE', descriptionKey: 'CONTACT.CHANNEL_PHONE_DESC', icon: 'phone', link: 'tel:912345678' },
    { id: '2', nameKey: 'CONTACT.CHANNEL_EMAIL', descriptionKey: 'CONTACT.CHANNEL_EMAIL_DESC', icon: 'email', link: 'mailto:info@office.es' }
  ];

  beforeEach(async () => {
    contactService = jasmine.createSpyObj('ContactService', ['getOffices', 'getChannels']);
    contactService.getOffices.and.returnValue(of(mockOffices));
    contactService.getChannels.and.returnValue(of(mockChannels));

    await TestBed.configureTestingModule({
    declarations: [ContactComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [TranslateModule.forRoot(), RouterTestingModule, ReactiveFormsModule],
    providers: [
        { provide: ContactService, useValue: contactService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load offices and channels on init', () => {
    fixture.detectChanges();
    expect(contactService.getOffices).toHaveBeenCalled();
    expect(contactService.getChannels).toHaveBeenCalled();
    expect(component.offices.length).toBe(2);
    expect(component.channels.length).toBe(2);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle empty offices', () => {
    contactService.getOffices.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component.offices.length).toBe(0);
  });

  it('should have form with required validators', () => {
    const form = component.contactForm;
    expect(form.get('name')?.valid).toBeFalse();
    expect(form.get('email')?.valid).toBeFalse();
    expect(form.get('subject')?.valid).toBeFalse();
    expect(form.get('message')?.valid).toBeFalse();
  });

  it('should validate email format', () => {
    component.contactForm.patchValue({ email: 'invalid-email' });
    expect(component.contactForm.get('email')?.valid).toBeFalse();

    component.contactForm.patchValue({ email: 'valid@email.com' });
    expect(component.contactForm.get('email')?.valid).toBeTrue();
  });

  it('should validate minimum length for name', () => {
    component.contactForm.patchValue({ name: 'A' });
    expect(component.contactForm.get('name')?.valid).toBeFalse();

    component.contactForm.patchValue({ name: 'John' });
    expect(component.contactForm.get('name')?.valid).toBeTrue();
  });

  it('should validate minimum length for subject', () => {
    component.contactForm.patchValue({ subject: 'Hi' });
    expect(component.contactForm.get('subject')?.valid).toBeFalse();

    component.contactForm.patchValue({ subject: 'Hello there' });
    expect(component.contactForm.get('subject')?.valid).toBeTrue();
  });

  it('should validate minimum length for message', () => {
    component.contactForm.patchValue({ message: 'Short' });
    expect(component.contactForm.get('message')?.valid).toBeFalse();

    component.contactForm.patchValue({ message: 'This is a message with enough length to pass validation' });
    expect(component.contactForm.get('message')?.valid).toBeTrue();
  });

  it('should submit valid form and reset', () => {
    component.contactForm.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message with sufficient length for validation'
    });

    component.onSubmit();

    expect(component.formSubmitted).toBeTrue();
    expect(component.contactForm.get('name')?.value).toBeNull();
  });

  it('should not submit invalid form', () => {
    component.formSubmitted = false;
    component.contactForm.patchValue({ name: '', email: '', subject: '', message: '' });

    component.onSubmit();

    expect(component.formSubmitted).toBeFalse();
  });
});
