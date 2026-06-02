import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContactService, ContactMessagePayload } from '../../../application/services/contact.service';
import { ContactOffice, ContactChannel } from '../../../application/models/sede.models';
import { ToastService } from '../../../application/services/toast.service';

import { trackByIndex } from '../../../application/utils/track-by.utils';
import { RouterLink } from '@angular/router';
import { NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.css'],
    imports: [NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, FormsModule, ReactiveFormsModule, TranslatePipe]
})
export class ContactComponent implements OnInit {
  offices: ContactOffice[] = [];
  channels: ContactChannel[] = [];
  isLoading = true;
  formSubmitted = false;
  isSubmitting = false;

  readonly contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(5)]],
    message: ['', [Validators.required, Validators.minLength(20)]]
  });

  protected readonly trackByIndex = trackByIndex;

  constructor(
    private readonly contactService: ContactService,
    private readonly fb: FormBuilder,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.contactService.getOffices().subscribe((offices) => {
      this.offices = offices;
    });
    this.contactService.getChannels().subscribe((channels) => {
      this.channels = channels;
      this.isLoading = false;
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload: ContactMessagePayload = {
      fullName: this.contactForm.value.name!,
      email: this.contactForm.value.email!,
      subject: this.contactForm.value.subject!,
      message: this.contactForm.value.message!
    };

    this.contactService.sendMessage(payload).subscribe({
      next: () => {
        this.formSubmitted = true;
        this.contactForm.reset();
        this.isSubmitting = false;
        this.toast.success('Mensaje enviado correctamente. Te responderemos lo antes posible.');
      },
      error: () => {
        this.isSubmitting = false;
        this.toast.error('Error al enviar el mensaje. Intentalo de nuevo mas tarde.');
      }
    });
  }
}
