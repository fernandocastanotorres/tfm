import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

type ErrorVariant = '403' | '404' | '500';

@Component({
    selector: 'app-error-page',
    templateUrl: './error-page.component.html'
})
export class ErrorPageComponent {
  readonly variant: ErrorVariant;
  readonly title: string;
  readonly description: string;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly location: Location
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
          title: 'No tienes permisos para ver esta pagina',
          description: 'Tu sesion no tiene privilegios suficientes para acceder al recurso solicitado.'
        };
      case '500':
        return {
          title: 'Ha ocurrido un error del servidor',
          description: 'Estamos trabajando en solucionarlo. Puedes volver atras o intentar de nuevo en unos minutos.'
        };
      default:
        return {
          title: 'No hemos encontrado la pagina solicitada',
          description: 'La URL puede ser incorrecta o el contenido haberse movido.'
        };
    }
  }
}
