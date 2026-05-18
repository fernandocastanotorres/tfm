import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ThemePalette } from '../models/sede.models';

@Injectable({ providedIn: 'root' })
export class ThemePaletteService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/citizen/public-content/theme`;
  private readonly appliedTokens = new Set<string>();

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
    this.appliedTokens.forEach((token) => root.style.removeProperty(token));
    this.appliedTokens.clear();

    const normalized = this.normalizeColors(palette.colors);

    normalized.forEach((color) => {
      if (!color?.token || !color?.value) {
        return;
      }
      const token = color.token.trim();
      root.style.setProperty(token, color.value.trim());
      this.appliedTokens.add(token);
    });
  }

  private normalizeColors(colors: ThemePalette['colors']): ThemePalette['colors'] {
    const result: ThemePalette['colors'] = [];
    const seen = new Set<string>();

    colors.forEach((color) => {
      const token = color?.token?.trim();
      const value = color?.value?.trim();
      if (!token || !value) {
        return;
      }

      if (!seen.has(token)) {
        result.push({ token, value });
        seen.add(token);
        return;
      }

      if (!token.endsWith('-dark')) {
        const darkToken = `${token}-dark`;
        if (!seen.has(darkToken)) {
          result.push({ token: darkToken, value });
          seen.add(darkToken);
        }
      }
    });

    return result;
  }
}
