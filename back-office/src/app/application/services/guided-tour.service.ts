import { Injectable } from '@angular/core';
import introJs from 'intro.js';

@Injectable({
  providedIn: 'root'
})
export class GuidedTourService {
  startBackofficeTour(): void {
    const steps = [
      {
        element: '[data-tour="bo-sidebar"]',
        intro: 'Este menu lateral agrupa las areas clave del backoffice.'
      },
      {
        element: '[data-tour="bo-header"]',
        intro: 'Aqui veras el contexto de pagina y tu rol operativo.'
      },
      {
        element: '[data-tour="bo-main"]',
        intro: 'En esta zona central se muestran expedientes, tareas e informes.'
      },
      {
        element: '[data-tour="bo-help"]',
        intro: 'Puedes abrir esta guia cuando lo necesites.'
      }
    ].filter((step) => !!document.querySelector(step.element));

    if (steps.length === 0) {
      return;
    }

    introJs().setOptions({
      steps,
      showProgress: true,
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      doneLabel: 'Finalizar',
      skipLabel: 'Cerrar'
    }).start();
  }
}
