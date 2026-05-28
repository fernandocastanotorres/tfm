import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div
      class="animate-pulse bg-surface-200"
      [class.h-4]="variant === 'text'"
      [class.rounded]="variant === 'text'"
      [class.rounded-lg]="variant === 'rectangular'"
      [class.rounded-full]="variant === 'circular'"
      [style.width]="width"
      [style.height]="height"
      role="status"
      aria-live="polite"
      [attr.aria-label]="ariaLabel"
    ></div>
  `,
})
export class SkeletonComponent {
  @Input() variant: 'text' | 'rectangular' | 'circular' = 'text';
  @Input() width?: string;
  @Input() height?: string;
  @Input() ariaLabel = 'Cargando...';
}
