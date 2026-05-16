import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LegislationItem } from '../models/sede.models';

@Injectable({
  providedIn: 'root'
})
export class LegislationService {
  private readonly legislation: LegislationItem[] = [
    {
      id: '1',
      titleKey: 'LEGISLATION.LAW_39_2015',
      type: 'law',
      date: '2015-10-01',
      descriptionKey: 'LEGISLATION.LAW_39_2015_DESC',
      externalUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565'
    },
    {
      id: '2',
      titleKey: 'LEGISLATION.LAW_40_2015',
      type: 'law',
      date: '2015-10-01',
      descriptionKey: 'LEGISLATION.LAW_40_2015_DESC',
      externalUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-10566'
    },
    {
      id: '3',
      titleKey: 'LEGISLATION.RD_203_2021',
      type: 'decree',
      date: '2021-03-30',
      descriptionKey: 'LEGISLATION.RD_203_2021_DESC'
    },
    {
      id: '4',
      titleKey: 'LEGISLATION.ENS_RD_311_2022',
      type: 'decree',
      date: '2022-05-03',
      descriptionKey: 'LEGISLATION.ENS_RD_311_2022_DESC'
    },
    {
      id: '5',
      titleKey: 'LEGISLATION.LOPDGDD_3_2018',
      type: 'law',
      date: '2018-12-05',
      descriptionKey: 'LEGISLATION.LOPDGDD_3_2018_DESC',
      externalUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673'
    },
    {
      id: '6',
      titleKey: 'LEGISLATION.ORDER_ELECTRONIC_INVOICE',
      type: 'order',
      date: '2023-01-15',
      descriptionKey: 'LEGISLATION.ORDER_ELECTRONIC_INVOICE_DESC'
    },
    {
      id: '7',
      titleKey: 'LEGISLATION.RESOLUTION_ACCESSIBILITY',
      type: 'resolution',
      date: '2023-06-20',
      descriptionKey: 'LEGISLATION.RESOLUTION_ACCESSIBILITY_DESC'
    }
  ];

  getAll(): Observable<LegislationItem[]> {
    return of(this.legislation).pipe(delay(300));
  }

  getByType(type: string): Observable<LegislationItem[]> {
    if (type === 'all') {
      return of(this.legislation).pipe(delay(300));
    }
    return of(this.legislation.filter(l => l.type === type)).pipe(delay(300));
  }

  getTypes(): Observable<string[]> {
    return of(['all', 'law', 'decree', 'order', 'resolution']).pipe(delay(300));
  }
}
