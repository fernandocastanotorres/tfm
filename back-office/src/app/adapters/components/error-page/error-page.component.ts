import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

type ErrorVariant = '403' | '404' | '500';

@Component({
  selector: 'app-error-page',
  standalone: false,
  templateUrl: './error-page.component.html'
})
export class ErrorPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly translateService = inject(TranslateService);

  readonly variant: ErrorVariant;
  readonly title: string;
  readonly description: string;

  constructor() {
    const fromRoute = (this.route.snapshot.data['variant'] ?? '404') as ErrorVariant;
    this.variant = ['403', '404', '500'].includes(fromRoute) ? fromRoute : '404';

    const copy = this.buildCopy(this.variant);
    this.title = copy.title;
    this.description = copy.description;
  }

  goDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    this.location.back();
  }

  private buildCopy(variant: ErrorVariant): { title: string; description: string } {
    switch (variant) {
      case '403':
        return {
          title: this.translateService.instant('BO.ERROR.403_TITLE'),
          description: this.translateService.instant('BO.ERROR.403_DESC')
        };
      case '500':
        return {
          title: this.translateService.instant('BO.ERROR.500_TITLE'),
          description: this.translateService.instant('BO.ERROR.500_DESC')
        };
      default:
        return {
          title: this.translateService.instant('BO.ERROR.404_TITLE'),
          description: this.translateService.instant('BO.ERROR.404_DESC')
        };
    }
  }
}
