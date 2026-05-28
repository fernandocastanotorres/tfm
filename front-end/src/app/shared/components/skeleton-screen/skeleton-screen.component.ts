import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div role="status" aria-live="polite" [attr.aria-label]="ariaLabel">
      <ng-container [ngSwitch]="pattern">
        <!-- Full page: header + filters + content list -->
        <div *ngSwitchCase="'page'" class="max-w-4xl mx-auto">
          <div class="space-y-2">
            <div class="h-4 w-24 rounded bg-surface-200 animate-pulse"></div>
            <div class="h-7 w-56 rounded bg-surface-200 animate-pulse"></div>
            <div class="h-4 w-80 rounded bg-surface-200 animate-pulse"></div>
          </div>
          <div class="mt-6 flex flex-wrap gap-3">
            <div *ngFor="let _ of filterButtons; trackBy: trackByIndex" class="h-10 w-24 rounded-xl bg-surface-200 animate-pulse"></div>
          </div>
          <div class="mt-6 space-y-4">
            <div *ngFor="let _ of rowItems; trackBy: trackByIndex" class="card p-5 animate-pulse">
              <div class="h-5 w-3/4 rounded bg-surface-200"></div>
              <div class="mt-3 h-3 w-full rounded bg-surface-100"></div>
              <div class="mt-2 h-3 w-2/3 rounded bg-surface-100"></div>
            </div>
          </div>
        </div>

        <!-- List: header + list items -->
        <div *ngSwitchCase="'list'" class="max-w-4xl mx-auto">
          <div class="space-y-2">
            <div class="h-7 w-56 rounded bg-surface-200 animate-pulse"></div>
            <div class="h-4 w-80 rounded bg-surface-200 animate-pulse"></div>
          </div>
          <div class="mt-6 space-y-3">
            <div *ngFor="let _ of rowItems; trackBy: trackByIndex" class="flex items-start gap-4 animate-pulse">
              <div class="h-10 w-10 shrink-0 rounded-full bg-surface-200"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 w-3/4 rounded bg-surface-200"></div>
                <div class="h-3 w-full rounded bg-surface-100"></div>
                <div class="h-3 w-1/2 rounded bg-surface-100"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card grid -->
        <div *ngSwitchCase="'card-grid'" class="grid gap-4" [class.md:grid-cols-2]="true">
          <div *ngFor="let _ of rowItems; trackBy: trackByIndex" class="card p-5 animate-pulse">
            <div class="h-5 w-1/3 rounded bg-surface-200"></div>
            <div class="mt-4 space-y-3">
              <div *ngFor="let _ of lineSlots; trackBy: trackByIndex" class="h-3 rounded bg-surface-100"></div>
            </div>
            <div class="mt-5 h-9 w-32 rounded bg-surface-200"></div>
          </div>
        </div>

        <!-- Table: header + rows -->
        <div *ngSwitchCase="'table'" class="bg-white rounded-lg shadow overflow-hidden animate-pulse">
          <div class="bg-gray-50 border-b border-gray-200 px-6 py-3 flex gap-8">
            <div *ngFor="let _ of columnHeaders; trackBy: trackByIndex" class="h-4 w-20 rounded bg-surface-200"></div>
          </div>
          <div *ngFor="let _ of rowItems; trackBy: trackByIndex" class="border-b border-gray-100 px-6 py-4 flex gap-8">
            <div *ngFor="let _ of columnHeaders; trackBy: trackByIndex" class="h-4 w-16 rounded bg-surface-100"></div>
          </div>
        </div>

        <!-- Detail: header + metadata + sections -->
        <div *ngSwitchCase="'detail'" class="max-w-5xl mx-auto space-y-6">
          <div class="space-y-2 animate-pulse">
            <div class="h-4 w-24 rounded bg-surface-200"></div>
            <div class="h-7 w-72 rounded bg-surface-200"></div>
            <div class="h-4 w-48 rounded bg-surface-200"></div>
            <div class="h-6 w-28 rounded-full bg-surface-200"></div>
          </div>
          <div class="card p-6 animate-pulse">
            <div class="h-5 w-32 rounded bg-surface-200"></div>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div *ngFor="let _ of columnHeaders; trackBy: trackByIndex" class="space-y-1">
                <div class="h-3 w-16 rounded bg-surface-100"></div>
                <div class="h-4 w-32 rounded bg-surface-200"></div>
              </div>
            </div>
          </div>
          <div class="card p-6 animate-pulse">
            <div class="h-5 w-28 rounded bg-surface-200"></div>
            <div class="mt-4 space-y-4">
              <div *ngFor="let _ of rowItems; trackBy: trackByIndex" class="flex gap-4">
                <div class="h-12 w-12 shrink-0 rounded bg-surface-100"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 w-3/4 rounded bg-surface-200"></div>
                  <div class="h-3 w-1/2 rounded bg-surface-100"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters bar -->
        <div *ngSwitchCase="'filters'" class="flex flex-wrap gap-3 animate-pulse">
          <div *ngFor="let _ of filterButtons; trackBy: trackByIndex" class="h-10 w-24 rounded-xl bg-surface-200"></div>
          <div class="h-10 w-64 rounded-xl bg-surface-200"></div>
          <div class="h-10 w-44 rounded-xl bg-surface-200"></div>
        </div>

        <!-- Form -->
        <div *ngSwitchCase="'form'" class="max-w-2xl mx-auto space-y-5 animate-pulse">
          <div *ngFor="let _ of rowItems; trackBy: trackByIndex" class="space-y-1">
            <div class="h-4 w-24 rounded bg-surface-200"></div>
            <div class="h-10 w-full rounded-xl bg-surface-100"></div>
          </div>
          <div class="h-12 w-40 rounded-xl bg-surface-200"></div>
        </div>
      </ng-container>
    </div>
  `,
})
export class SkeletonScreenComponent {
  @Input() pattern: 'page' | 'list' | 'card-grid' | 'table' | 'detail' | 'filters' | 'form' = 'page';
  @Input() count = 5;
  @Input() lines = 3;
  @Input() columns = 4;
  @Input() ariaLabel = 'Cargando contenido...';

  get rowItems(): number[] {
    return Array.from({ length: Math.max(1, this.count) }, (_, i) => i);
  }

  get lineSlots(): number[] {
    return Array.from({ length: Math.max(1, this.lines) }, (_, i) => i);
  }

  get filterButtons(): number[] {
    return Array.from({ length: 3 }, (_, i) => i);
  }

  get columnHeaders(): number[] {
    return Array.from({ length: Math.max(1, this.columns) }, (_, i) => i);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
