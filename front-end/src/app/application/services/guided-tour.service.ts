import { Injectable } from '@angular/core';
import introJs from 'intro.js';

interface TourStepDefinition {
  element: string;
  intro: string;
  position?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
}

@Injectable({
  providedIn: 'root'
})
export class GuidedTourService {
  startCitizenTour(currentRoute: string): void {
    const baseSteps: TourStepDefinition[] = [
      {
        element: '[data-tour="citizen-nav"]',
        intro: 'Este menu principal estructura las areas funcionales de la sede electronica: tramitacion, informacion institucional y recursos de apoyo a la ciudadania.'
      },
      {
        element: '[data-tour="citizen-locale"]',
        intro: 'Este selector aplica el idioma institucional a todo el portal y actualiza los contenidos conforme a la preferencia linguistica elegida.'
      },
      {
        element: '[data-tour="citizen-login"]',
        intro: 'Este acceso permite autenticarse para iniciar expedientes, consultar su tramitacion y operar en servicios con identificacion obligatoria.'
      },
      {
        element: '[data-tour="citizen-help"]',
        intro: 'Este boton relanza la guia contextual de la pagina activa con instrucciones adaptadas al contenido mostrado.'
      }
    ];

    const pageSteps = this.resolvePageSteps(currentRoute);
    const steps = [...baseSteps, ...pageSteps].filter((step) => !!document.querySelector(step.element));

    if (steps.length === 0) {
      return;
    }

    introJs().setOptions({
      steps,
      showProgress: true,
      tooltipClass: 'tfg-tour-tooltip',
      highlightClass: 'tfg-tour-highlight',
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      doneLabel: 'Finalizar',
      skipLabel: '✕'
    }).start();
  }

  private resolvePageSteps(currentRoute: string): TourStepDefinition[] {
    const route = currentRoute.split('?')[0];

    const routeMap: Array<{ match: (r: string) => boolean; steps: TourStepDefinition[] }> = [
      {
        match: (r) => r === '/sede' || r === '/sede/',
        steps: [
          { element: '#home-title', intro: 'Esta portada resume accesos directos y servicios principales para empezar rapidamente.' },
          { element: '.public-home__quick-grid', intro: 'Este panel centraliza accesos prioritarios a procedimientos, consultas frecuentes, contacto, cita previa y transparencia.' },
          { element: '.public-home__procedures-grid', intro: 'Este bloque presenta procedimientos destacados con informacion operativa de coste y plazo estimado.' },
          { element: '.public-home__events-list', intro: 'Este espacio recoge hitos y plazos proximos de interes para la gestion ciudadana.' }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/procedimientos') && r.endsWith('/flujo'),
        steps: [
          { element: '#procedure-flow-title', intro: 'Esta vista detalla la secuencia completa de tramitacion del procedimiento seleccionado.' },
          { element: '.card.p-6', intro: 'Aqui se especifica la fase activa y las actuaciones requeridas: declaracion de datos, aportacion documental o validacion administrativa.' },
          { element: 'a.btn-primary', intro: 'Use este acceso para iniciar la tramitacion efectiva del expediente con control de autenticacion.' },
          { element: 'aside.card', intro: 'Este panel resume parametros operativos del procedimiento: unidad competente, plazo de resolucion y regimen economico.' }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/procedimientos'),
        steps: [
          { element: '#procedures-title', intro: 'Esta seccion publica el inventario de procedimientos disponibles para su inicio telematico.' },
          { element: '.md\\:grid-cols-2', intro: 'Cada ficha describe condiciones de tramitacion: estado, importe, plazo y unidad responsable.' },
          { element: 'button.btn-primary', intro: 'El boton Iniciar abre el flujo operativo del procedimiento y aplica controles de acceso cuando proceda.' }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/faq'),
        steps: [
          { element: '#faq-title', intro: 'Este apartado concentra respuestas normalizadas a incidencias y dudas habituales de tramitacion.' },
          { element: '#faq-search', intro: 'Utilice la busqueda por termino para localizar respuestas de forma inmediata.' },
          { element: '#faq-category', intro: 'Aplique filtros tematicos para acotar el contenido al ambito de consulta.' },
          { element: '.faq__list', intro: 'Cada entrada desplegable recoge criterios operativos y orientaciones de uso.' }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/contacto'),
        steps: [
          { element: '#contact-title', intro: 'Este espacio integra los canales oficiales de relacion y asistencia a la ciudadania.' },
          { element: '.contact__channels-grid', intro: 'Aqui se detallan vias de atencion telematica y sus condiciones de uso.' },
          { element: '.contact__offices-grid', intro: 'Este bloque identifica oficinas, horarios de atencion y datos de contacto presencial.' },
          { element: '.contact__form', intro: 'Mediante este formulario puede registrar consultas formales y solicitar seguimiento administrativo.' }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/institucional'),
        steps: [
          { element: '#institutional-title', intro: 'Esta seccion describe la arquitectura institucional, competencias y principios de actuacion publica.' },
          { element: '.institutional__grid', intro: 'Cada bloque desarrolla informacion corporativa relevante para la rendicion de cuentas.' }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/normativa'),
        steps: [
          { element: '#legislation-title', intro: 'Este repositorio normativo publica el marco juridico aplicable a la actividad administrativa digital.' },
          { element: '#legislation-type-filter', intro: 'Este filtro clasifica disposiciones por tipologia juridica para facilitar el analisis regulatorio.' },
          { element: '.legislation__list', intro: 'Cada referencia incorpora vigencia, contexto y acceso a fuente o texto descargable oficial.' }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/estado'),
        steps: [
          { element: '#status-title', intro: 'Este panel informa del nivel de disponibilidad de los servicios electronicos en tiempo casi real.' },
          { element: '.service-status__summary', intro: 'Resumen ejecutivo de continuidad de servicio con sello temporal de actualizacion.' },
          { element: '.service-status__list', intro: 'Detalle por servicio para detectar incidencias, mantenimiento planificado o degradaciones puntuales.' }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/organismo'),
        steps: [
          { element: '#organisms-title', intro: 'Directorio institucional de organismos y unidades competentes en la tramitacion.' },
          { element: '#organism-search', intro: 'Busque por denominacion o termino clave para localizar el organo responsable.' },
          { element: '#organism-category', intro: 'Filtre por categoria funcional para delimitar el ambito administrativo.' },
          { element: '.organisms__grid', intro: 'Cada ficha ofrece datos de contacto, localizacion y referencia web oficial.' }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/transparencia'),
        steps: [
          { element: '#transparency-title', intro: 'Portal de transparencia para consulta de indicadores de gestion y publicidad activa.' },
          { element: '.transparency__metrics-grid', intro: 'Cuadro de indicadores agregados sobre actividad administrativa, tiempos y nivel de servicio.' },
          { element: '.transparency__reports-list', intro: 'Repositorio de informes oficiales descargables para auditoria y evaluacion publica.' }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/calendario'),
        steps: [
          { element: '#calendar-title', intro: 'Calendario oficial de obligaciones temporales, hitos de procedimiento y convocatorias.' },
          { element: '#calendar-type-filter', intro: 'Filtro por tipologia de evento para focalizar el seguimiento operativo.' },
          { element: '.calendar__list', intro: 'Secuencia cronologica con detalle descriptivo y vinculacion al tramite afectado cuando corresponda.' }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/glosario'),
        steps: [
          { element: '#glossary-title', intro: 'Glosario institucional para normalizar la interpretacion terminologica de la tramitacion electronica.' },
          { element: '#glossary-search', intro: 'Busqueda directa de conceptos para consulta puntual.' },
          { element: '.glossary__letters', intro: 'Indice alfabetico para exploracion sistematica de terminos.' },
          { element: '.glossary__list', intro: 'Cada entrada ofrece definicion oficial y relaciones semanticas de apoyo.' }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/accesibilidad'),
        steps: [
          { element: '#accessibility-title', intro: 'Declaracion de accesibilidad de la sede conforme al marco normativo aplicable.' },
          { element: '.accessibility__content', intro: 'Detalle de medidas implantadas, nivel de conformidad y procedimiento de comunicacion de barreras.' }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/mapa'),
        steps: [
          { element: '#sitemap-title', intro: 'Mapa estructural del portal para localizacion integral de contenidos y servicios.' },
          { element: '.sitemap__grid', intro: 'Relacion jerarquizada de secciones con acceso directo por bloque funcional.' }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/citas'),
        steps: [
          { element: '#appointments-title', intro: 'Modulo operativo de cita previa: consulta, filtrado y gestion de reservas.' },
          { element: '#appointments-search', intro: 'Busqueda de citas por criterio textual para recuperar una gestion concreta.' },
          { element: '.mt-8.grid.gap-4', intro: 'Listado operativo con estado de cita y acciones de reprogramacion o anulacion.' },
          { element: '#slot-title', intro: 'Selector de disponibilidad horaria para nuevas reservas o ajustes de agenda.' }
        ]
      }
    ];

    const matched = routeMap.find((entry) => entry.match(route));
    return matched?.steps ?? [
      { element: 'main.public-main', intro: 'Area principal de contenido. La guia adapta instrucciones segun el contexto funcional de la ruta activa.' }
    ];
  }
}
