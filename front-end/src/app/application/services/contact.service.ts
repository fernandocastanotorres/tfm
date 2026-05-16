import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ContactOffice, ContactChannel } from '../models/sede.models';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly offices: ContactOffice[] = [
    {
      id: 'central',
      nameKey: 'CONTACT.OFFICE_CENTRAL',
      addressKey: 'CONTACT.ADDRESS_CENTRAL',
      phone: '900 123 456',
      email: 'sede@administracion.es',
      scheduleKey: 'CONTACT.SCHEDULE_GENERAL',
      mapUrl: '#'
    },
    {
      id: 'north',
      nameKey: 'CONTACT.OFFICE_NORTH',
      addressKey: 'CONTACT.ADDRESS_NORTH',
      phone: '900 123 457',
      email: 'norte@administracion.es',
      scheduleKey: 'CONTACT.SCHEDULE_GENERAL'
    },
    {
      id: 'south',
      nameKey: 'CONTACT.OFFICE_SOUTH',
      addressKey: 'CONTACT.ADDRESS_SOUTH',
      phone: '900 123 458',
      email: 'sur@administracion.es',
      scheduleKey: 'CONTACT.SCHEDULE_EXTENDED'
    }
  ];

  private readonly channels: ContactChannel[] = [
    {
      id: 'phone',
      nameKey: 'CONTACT.CHANNEL_PHONE',
      descriptionKey: 'CONTACT.CHANNEL_PHONE_DESC',
      icon: 'phone',
      link: 'tel:900123456'
    },
    {
      id: 'email',
      nameKey: 'CONTACT.CHANNEL_EMAIL',
      descriptionKey: 'CONTACT.CHANNEL_EMAIL_DESC',
      icon: 'email',
      link: 'mailto:sede@administracion.es'
    },
    {
      id: 'chat',
      nameKey: 'CONTACT.CHANNEL_CHAT',
      descriptionKey: 'CONTACT.CHANNEL_CHAT_DESC',
      icon: 'chat'
    },
    {
      id: 'presential',
      nameKey: 'CONTACT.CHANNEL_PRESENTIAL',
      descriptionKey: 'CONTACT.CHANNEL_PRESENTIAL_DESC',
      icon: 'building'
    }
  ];

  getOffices(): Observable<ContactOffice[]> {
    return of(this.offices).pipe(delay(300));
  }

  getChannels(): Observable<ContactChannel[]> {
    return of(this.channels).pipe(delay(300));
  }
}
