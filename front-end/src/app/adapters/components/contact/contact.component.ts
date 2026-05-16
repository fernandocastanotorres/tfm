import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ContactService } from '../../../application/services/contact.service';
import { ContactOffice, ContactChannel } from '../../../application/models/sede.models';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  offices: ContactOffice[] = [];
  channels: ContactChannel[] = [];
  isLoading = true;
  formSubmitted = false;

  readonly contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(5)]],
    message: ['', [Validators.required, Validators.minLength(20)]]
  });

  constructor(
    private readonly contactService: ContactService,
    private readonly fb: FormBuilder
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
    if (this.contactForm.valid) {
      this.formSubmitted = true;
      this.contactForm.reset();
    }
  }
}
