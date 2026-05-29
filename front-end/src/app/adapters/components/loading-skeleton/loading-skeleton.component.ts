import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './loading-skeleton.component.html'
})
export class LoadingSkeletonComponent {
  @Input() cards = 3;
  @Input() lines = 3;

  get cardSlots(): number[] {
    return Array.from({ length: Math.max(1, this.cards) }, (_, idx) => idx);
  }

  get lineSlots(): number[] {
    return Array.from({ length: Math.max(1, this.lines) }, (_, idx) => idx);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
