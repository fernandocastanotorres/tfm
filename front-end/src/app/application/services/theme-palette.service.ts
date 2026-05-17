import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ThemePalette } from '../models/sede.models';

@Injectable({ providedIn: 'root' })
export class ThemePaletteService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/citizen/public-content/theme`;

  loadAndApply(): Observable<ThemePalette | null> {
    const params = new HttpParams().set('ts', Date.now());
    return this.http.get<ThemePalette>(this.endpoint, { params }).pipe(
      map((palette) => {
        this.applyPalette(palette);
        return palette;
      }),
      catchError(() => of(null))
    );
  }

  private applyPalette(palette: ThemePalette): void {
    if (!palette || !Array.isArray(palette.colors)) {
      return;
    }

    const root = document.documentElement;
    palette.colors.forEach((color) => {
      if (!color?.token || !color?.value) {
        return;
      }
      root.style.setProperty(color.token.trim(), color.value.trim());
    });
  }
}
