import { Injectable } from '@angular/core';
import introJs from 'intro.js';

@Injectable({
  providedIn: 'root'
})
export class GuidedTourService {
  startCitizenTour(): void {
    const steps = [
      {
        element: '[data-tour="citizen-nav"]',
        intro: 'Desde aqui puedes navegar por procedimientos, informacion y recursos de la sede.'
      },
      {
        element: '[data-tour="citizen-locale"]',
        intro: 'Cambia el idioma de toda la sede desde este selector.'
      },
      {
        element: '[data-tour="citizen-login"]',
        intro: 'Accede o crea tu cuenta para iniciar y gestionar expedientes.'
      },
      {
        element: '[data-tour="citizen-help"]',
        intro: 'Puedes relanzar esta guia en cualquier momento con este boton.'
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
