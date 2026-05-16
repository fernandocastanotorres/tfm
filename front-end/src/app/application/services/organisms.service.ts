import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { OrganismItem } from '../models/sede.models';

@Injectable({
  providedIn: 'root'
})
export class OrganismsService {
  private readonly organisms: OrganismItem[] = [
    {
      id: 'urbanism',
      nameKey: 'ORGANISMS.URBANISM',
      descriptionKey: 'ORGANISMS.URBANISM_DESC',
      categoryKey: 'ORGANISMS.CAT_PLANNING',
      phone: '900 111 222',
      email: 'urbanismo@administracion.es',
      addressKey: 'ORGANISMS.ADDRESS_CENTRAL',
      websiteUrl: '#'
    },
    {
      id: 'registry',
      nameKey: 'ORGANISMS.REGISTRY',
      descriptionKey: 'ORGANISMS.REGISTRY_DESC',
      categoryKey: 'ORGANISMS.CAT_CITIZEN',
      phone: '900 111 333',
      email: 'padron@administracion.es',
      addressKey: 'ORGANISMS.ADDRESS_CENTRAL'
    },
    {
      id: 'taxes',
      nameKey: 'ORGANISMS.TAXES',
      descriptionKey: 'ORGANISMS.TAXES_DESC',
      categoryKey: 'ORGANISMS.CAT_ECONOMIC',
      phone: '900 111 444',
      email: 'tributos@administracion.es',
      addressKey: 'ORGANISMS.ADDRESS_NORTH',
      websiteUrl: '#'
    },
    {
      id: 'social-services',
      nameKey: 'ORGANISMS.SOCIAL_SERVICES',
      descriptionKey: 'ORGANISMS.SOCIAL_SERVICES_DESC',
      categoryKey: 'ORGANISMS.CAT_SOCIAL',
      phone: '900 111 555',
      email: 'servicios sociales@administracion.es',
      addressKey: 'ORGANISMS.ADDRESS_SOUTH'
    },
    {
      id: 'environment',
      nameKey: 'ORGANISMS.ENVIRONMENT',
      descriptionKey: 'ORGANISMS.ENVIRONMENT_DESC',
      categoryKey: 'ORGANISMS.CAT_ENVIRONMENT',
      phone: '900 111 666',
      email: 'medioambiente@administracion.es',
      addressKey: 'ORGANISMS.ADDRESS_CENTRAL'
    },
    {
      id: 'education',
      nameKey: 'ORGANISMS.EDUCATION',
      descriptionKey: 'ORGANISMS.EDUCATION_DESC',
      categoryKey: 'ORGANISMS.CAT_SOCIAL',
      phone: '900 111 777',
      email: 'educacion@administracion.es',
      addressKey: 'ORGANISMS.ADDRESS_NORTH'
    },
    {
      id: 'culture',
      nameKey: 'ORGANISMS.CULTURE',
      descriptionKey: 'ORGANISMS.CULTURE_DESC',
      categoryKey: 'ORGANISMS.CAT_SOCIAL',
      phone: '900 111 888',
      email: 'cultura@administracion.es',
      addressKey: 'ORGANISMS.ADDRESS_CENTRAL'
    },
    {
      id: 'infrastructure',
      nameKey: 'ORGANISMS.INFRASTRUCTURE',
      descriptionKey: 'ORGANISMS.INFRASTRUCTURE_DESC',
      categoryKey: 'ORGANISMS.CAT_PLANNING',
      phone: '900 111 999',
      email: 'infraestructuras@administracion.es',
      addressKey: 'ORGANISMS.ADDRESS_SOUTH'
    }
  ];

  private readonly categories: string[] = [
    'ORGANISMS.CAT_ALL',
    'ORGANISMS.CAT_PLANNING',
    'ORGANISMS.CAT_CITIZEN',
    'ORGANISMS.CAT_ECONOMIC',
    'ORGANISMS.CAT_SOCIAL',
    'ORGANISMS.CAT_ENVIRONMENT'
  ];

  getAll(): Observable<OrganismItem[]> {
    return of(this.organisms).pipe(delay(300));
  }

  getByCategory(category: string): Observable<OrganismItem[]> {
    if (category === 'all') {
      return of(this.organisms).pipe(delay(300));
    }
    return of(this.organisms.filter(o => o.categoryKey === category)).pipe(delay(300));
  }

  getCategories(): Observable<string[]> {
    return of(this.categories).pipe(delay(300));
  }

  search(query: string): Observable<OrganismItem[]> {
    const lower = query.toLowerCase();
    const results = this.organisms.filter(o =>
      o.nameKey.toLowerCase().includes(lower) ||
      o.descriptionKey.toLowerCase().includes(lower) ||
      o.email.toLowerCase().includes(lower)
    );
    return of(results).pipe(delay(300));
  }
}
