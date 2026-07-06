import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

type ErrorVariant = '403' | '404' | '500';

@Component({
    selector: 'app-error-page',
    templateUrl: './error-page.component.html',
    imports: [TranslatePipe]
})
export class ErrorPageComponent {
  readonly variant: ErrorVariant;
  readonly title: string;
  readonly description: string;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly location: Location,
    private readonly translateService: TranslateService
  ) {
    const fromRoute = (this.route.snapshot.data['variant'] ?? '404') as ErrorVariant;
    this.variant = ['403', '404', '500'].includes(fromRoute) ? fromRoute : '404';

    const copy = this.buildCopy(this.variant);
    this.title = copy.title;
    this.description = copy.description;
  }

  goHome(): void {
    this.router.navigate(['/sede']);
  }

  goBack(): void {
    this.location.back();
  }

  private buildCopy(variant: ErrorVariant): { title: string; description: string } {
    switch (variant) {
      case '403':
        return {
          title: this.translateService.instant('ERROR_PAGE.403_TITLE'),
          description: this.translateService.instant('ERROR_PAGE.403_DESC')
        };
      case '500':
        return {
          title: this.translateService.instant('ERROR_PAGE.500_TITLE'),
          description: this.translateService.instant('ERROR_PAGE.500_DESC')
        };
      default:
        return {
          title: this.translateService.instant('ERROR_PAGE.404_TITLE'),
          description: this.translateService.instant('ERROR_PAGE.404_DESC')
        };
    }
  }
}
