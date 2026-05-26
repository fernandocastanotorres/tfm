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
          title: 'No tienes permisos para acceder a esta seccion',
          description: 'Tu rol actual no permite abrir este recurso del back-office.'
        };
      case '500':
        return {
          title: 'Se ha producido un error interno',
          description: 'El equipo tecnico ya dispone de trazas para investigar el problema.'
        };
      default:
        return {
          title: 'La pagina solicitada no existe',
          description: 'Revisa la URL o vuelve al panel principal para continuar trabajando.'
        };
    }
  }
}
