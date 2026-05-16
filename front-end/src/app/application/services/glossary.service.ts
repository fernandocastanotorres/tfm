import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { GlossaryTerm } from '../models/sede.models';

@Injectable({
  providedIn: 'root'
})
export class GlossaryService {
  private readonly terms: GlossaryTerm[] = [
    {
      id: '1',
      term: 'Certificado Digital',
      definitionKey: 'GLOSSARY.DEF_DIGITAL_CERT',
      relatedTerms: ['FNMT', 'Cl@ve']
    },
    {
      id: '2',
      term: 'Registro Electrónico',
      definitionKey: 'GLOSSARY.DEF_ELECTRONIC_REGISTRY',
      relatedTerms: ['Sede Electronica']
    },
    {
      id: '3',
      term: 'Expediente',
      definitionKey: 'GLOSSARY.DEF_CASE',
      relatedTerms: ['Procedimiento', 'Tramite']
    },
    {
      id: '4',
      term: 'Procedimiento Administrativo',
      definitionKey: 'GLOSSARY.DEF_PROCEDURE',
      relatedTerms: ['Expediente', 'Tramite']
    },
    {
      id: '5',
      term: 'Notificacion Electronica',
      definitionKey: 'GLOSSARY.DEF_ELECTRONIC_NOTIFICATION',
      relatedTerms: ['Sede Electronica']
    },
    {
      id: '6',
      term: 'Cl@ve',
      definitionKey: 'GLOSSARY.DEF_CLAVE',
      relatedTerms: ['Certificado Digital']
    },
    {
      id: '7',
      term: 'FNMT',
      definitionKey: 'GLOSSARY.DEF_FNMT',
      relatedTerms: ['Certificado Digital']
    },
    {
      id: '8',
      term: 'Sede Electronica',
      definitionKey: 'GLOSSARY.DEF_SEDE',
      relatedTerms: ['Registro Electronico', 'Notificacion Electronica']
    },
    {
      id: '9',
      term: 'Tasa',
      definitionKey: 'GLOSSARY.DEF_FEE',
      relatedTerms: ['Pago']
    },
    {
      id: '10',
      term: 'Empadronamiento',
      definitionKey: 'GLOSSARY.DEF_REGISTRY',
      relatedTerms: ['Expediente']
    },
    {
      id: '11',
      term: 'Urbanismo',
      definitionKey: 'GLOSSARY.DEF_URBANISM',
      relatedTerms: ['Licencia', 'Procedimiento']
    },
    {
      id: '12',
      term: 'Plazo de Resolucion',
      definitionKey: 'GLOSSARY.DEF_DEADLINE',
      relatedTerms: ['Procedimiento']
    }
  ];

  getAll(): Observable<GlossaryTerm[]> {
    return of(this.terms).pipe(delay(300));
  }

  search(query: string): Observable<GlossaryTerm[]> {
    const lower = query.toLowerCase();
    const results = this.terms.filter(t =>
      t.term.toLowerCase().includes(lower) ||
      t.definitionKey.toLowerCase().includes(lower)
    );
    return of(results).pipe(delay(300));
  }

  getByLetter(letter: string): Observable<GlossaryTerm[]> {
    const results = this.terms.filter(t =>
      t.term.charAt(0).toUpperCase() === letter.toUpperCase()
    );
    return of(results).pipe(delay(300));
  }

  getLetters(): Observable<string[]> {
    const letters = [...new Set(this.terms.map(t => t.term.charAt(0).toUpperCase()))].sort();
    return of(letters).pipe(delay(300));
  }
}
