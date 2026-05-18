package es.tfg.records.infrastructure.config;

import es.tfg.records.domain.model.CaseStatus;
import es.tfg.records.domain.model.Procedure;
import es.tfg.records.domain.model.ProcedureTask;
import es.tfg.records.domain.model.ProcedureType;
import es.tfg.records.domain.model.TaskType;
import es.tfg.records.domain.model.User;
import es.tfg.records.domain.port.ProcedureRepository;
import es.tfg.records.domain.port.ProcedureTypeRepository;
import es.tfg.records.domain.port.UserRepository;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTaskEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTypeI18nEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTaskFieldI18nEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTypeEntity;
import es.tfg.records.infrastructure.persistence.entity.PublicContentEntryEntity;
import es.tfg.records.infrastructure.persistence.repository.PublicContentEntryJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTypeI18nJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTaskFieldI18nJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTaskJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTypeJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Data initializer for development seeding.
 * Only active in the 'dev' profile.
 *
 * Seeds:
 * - Test users: citizen (dev@tfg.es) and admin (admin@tfg.es)
 * - Procedure types with form schemas and tasks
 * - Sample cases for the citizen user
 */
@Configuration
@Profile("dev")
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    // ── Procedure title translations (keyed by procedure key) ──
    private static final java.util.Map<String, java.util.Map<String, String>> PROCEDURE_TITLES = buildProcedureTitles();

    private static java.util.Map<String, java.util.Map<String, String>> buildProcedureTitles() {
        var m = new java.util.HashMap<String, java.util.Map<String, String>>();
        m.put("license-application", locales("Solicitud de Licencia", "Sol·licitud de Llicència", "Lizentzia Eskaera", "Solicitude de Licenza", "Sol·licitud de Llicència"));
        m.put("registry-certificate", locales("Certificado Registral", "Certificat Registral", "Erregistro Ziurtagiria", "Certificado Rexistral", "Certificat Registral"));
        m.put("address-update", locales("Actualización de Domicilio", "Actualització de Domicili", "Helbide Eguneraketa", "Actualización de Domicilio", "Actualització de Domicili"));
        m.put("building-permit", locales("Licencia de Obra", "Llicència d'Obra", "Obra Lizenzi", "Licenza de Obra", "Llicència d'Obra"));
        m.put("noise-complaint", locales("Denuncia por Ruidos", "Denúncia per Sorolls", "Zarata Salaketa", "Denuncia por Ruídos", "Denúncia per Sorolls"));
        m.put("street-occupancy", locales("Autorización de Ocupación de Vía Pública", "Autorització d'Ocupació de Via Pública", "Bide Publikoaren Okupazio Baimena", "Autorización de Ocupación de Vía Pública", "Autorització d'Ocupació de Via Pública"));
        m.put("business-opening", locales("Declaración de Apertura de Negocio", "Declaració d'Obertura de Negoci", "Negozio Irekieraren Adierazpena", "Declaración de Apertura de Negocio", "Declaració d'Obertura de Negoci"));
        m.put("tax-rebate", locales("Solicitud de Bonificación Fiscal", "Sol·licitud de Bonificació Fiscal", "Zerga Hobari Eskaera", "Solicitude de Bonificación Fiscal", "Sol·licitud de Bonificació Fiscal"));
        m.put("household-registration", locales("Empadronamiento de Familiar", "Empadronament de Familiar", "Senideen Errolda", "Empadroamento de Familiar", "Empadronament de Familiar"));
        m.put("social-aid", locales("Solicitud de Ayuda Social", "Sol·licitud d'Ajuda Social", "Laguntza Sozial Eskaera", "Solicitude de Axuda Social", "Sol·licitud d'Ajuda Social"));
        m.put("cultural-event", locales("Autorización de Evento Cultural", "Autorització d'Esdeveniment Cultural", "Ekitaldi Kulturalerako Baimena", "Autorización de Evento Cultural", "Autorització d'Esdeveniment Cultural"));
        m.put("tree-pruning", locales("Solicitud de Poda de Árboles", "Sol·licitud de Poda d'Arbres", "Zuhaitz Mozketa Eskaera", "Solicitude de Poda de Árbores", "Sol·licitud de Poda d'Arbres"));
        return Map.copyOf(m);
    }

    // ── Procedure description translations ──
    private static final java.util.Map<String, java.util.Map<String, String>> PROCEDURE_DESCRIPTIONS = buildProcedureDescriptions();

    private static java.util.Map<String, java.util.Map<String, String>> buildProcedureDescriptions() {
        var m = new java.util.HashMap<String, java.util.Map<String, String>>();
        m.put("license-application", locales("Solicite una licencia para nueva actividad o negocio. Inicia el flujo BPM genérico de procedimiento ciudadano.", "Sol·liciteu una llicència per a nova activitat o negoci. Inicia el flux BPM genèric de procediment ciutadà.", "Jarduera edo negozio berrirako lizentzia eskaera. Herritarren prozedura BPM fluxu orokorra abiarazten du.", "Solicite unha licenza para nova actividade ou negocio. Inicia o fluxo BPM xenérico de procedemento cidadán.", "Sol·liciteu una llicència per a nova activitat o negoci. Inicia el flux BPM genèric de procediment ciutadà."));
        m.put("registry-certificate", locales("Solicite un certificado registral oficial. Inicia el flujo BPM genérico de procedimiento ciudadano.", "Sol·liciteu un certificat registral oficial. Inicia el flux BPM genèric de procediment ciutadà.", "Erregistro ziurtagiri ofiziala eskaera. Herritarren prozedura BPM fluxu orokorra abiarazten du.", "Solicite un certificado rexistral oficial. Inicia o fluxo BPM xenérico de procedemento cidadán.", "Sol·liciteu un certificat registral oficial. Inicia el flux BPM genèric de procediment ciutadà."));
        m.put("address-update", locales("Actualice su domicilio registrado. Inicia el flujo BPM genérico de procedimiento ciudadano.", "Actualitzeu el vostre domicili registrat. Inicia el flux BPM genèric de procediment ciutadà.", "Erroldatutako helbidea eguneratu. Herritarren prozedura BPM fluxu orokorra abiarazten du.", "Actualice o seu domicilio rexistrado. Inicia o fluxo BPM xenérico de procedemento cidadán.", "Actualitzeu el vostre domicili registrat. Inicia el flux BPM genèric de procediment ciutadà."));
        m.put("building-permit", locales("Solicite una licencia municipal de obra. Inicia el flujo BPM genérico de procedimiento ciudadano.", "Sol·liciteu una llicència municipal d'obra. Inicia el flux BPM genèric de procediment ciutadà.", "Udal obra lizentzia eskaera. Herritarren prozedura BPM fluxu orokorra abiarazten du.", "Solicite unha licenza municipal de obra. Inicia o fluxo BPM xenérico de procedemento cidadán.", "Sol·liciteu una llicència municipal d'obra. Inicia el flux BPM genèric de procediment ciutadà."));
        m.put("noise-complaint", locales("Denuncie incidentes recurrentes de ruido para inspección municipal. Inicia el flujo BPM genérico de procedimiento ciudadano.", "Denuncieu incidents recurrents de soroll per inspecció municipal. Inicia el flux BPM genèric de procediment ciutadà.", "Zarata incidentzia errekurrenteak salatu udal ikuskaritzarako. Herritarren prozedura BPM fluxu orokorra abiarazten du.", "Denuncie incidentes recorrentes de ruído para inspección municipal. Inicia o fluxo BPM xenérico de procedemento cidadán.", "Denuncieu incidents recurrents de soroll per inspecció municipal. Inicia el flux BPM genèric de procediment ciutadà."));
        m.put("street-occupancy", locales("Solicite autorización para ocupar temporalmente espacio público. Inicia el flujo BPM genérico de procedimiento ciudadano.", "Sol·liciteu autorització per ocupar temporalment espai públic. Inicia el flux BPM genèric de procediment ciutadà.", "Espazio publikoa behin-behinean okupatzeko baimena eskaera. Herritarren prozedura BPM fluxu orokorra abiarazten du.", "Solicite autorización para ocupar temporalmente espazo público. Inicia o fluxo BPM xenérico de procedemento cidadán.", "Sol·liciteu autorització per ocupar temporalment espai públic. Inicia el flux BPM genèric de procediment ciutadà."));
        m.put("business-opening", locales("Presente una declaración para abrir una actividad comercial. Inicia el flujo BPM genérico de procedimiento ciudadano.", "Presenteu una declaració per obrir una activitat comercial. Inicia el flux BPM genèric de procediment ciutadà.", "Merkataritza jarduera irekitzeko adierazpena aurkeztu. Herritarren prozedura BPM fluxu orokorra abiarazten du.", "Presente unha declaración para abrir unha actividade comercial. Inicia o fluxo BPM xenérico de procedemento cidadán.", "Presenteu una declaració per obrir una activitat comercial. Inicia el flux BPM genèric de procediment ciutadà."));
        m.put("tax-rebate", locales("Solicite una bonificación fiscal municipal por circunstancias elegibles. Inicia el flujo BPM genérico de procedimiento ciudadano.", "Sol·liciteu una bonificació fiscal municipal per circumstàncies elegibles. Inicia el flux BPM genèric de procediment ciutadà.", "Zerga hobari udala eskaera baldintza egokietarako. Herritarren prozedura BPM fluxu orokorra abiarazten du.", "Solicite unha bonificación fiscal municipal por circunstancias elixibles. Inicia o fluxo BPM xenérico de procedemento cidadán.", "Sol·liciteu una bonificació fiscal municipal per circumstàncies elegibles. Inicia el flux BPM genèric de procediment ciutadà."));
        m.put("household-registration", locales("Registre un familiar en un domicilio municipal. Inicia el flujo BPM genérico de procedimiento ciudadano.", "Registreu un familiar en un domicili municipal. Inicia el flux BPM genèric de procediment ciutadà.", "Senidea udal batean erroldatu. Herritarren prozedura BPM fluxu orokorra abiarazten du.", "Rexistre un familiar nun domicilio municipal. Inicia o fluxo BPM xenérico de procedemento cidadán.", "Registreu un familiar en un domicili municipal. Inicia el flux BPM genèric de procediment ciutadà."));
        m.put("social-aid", locales("Solicite apoyo de ayuda social municipal. Inicia el flujo BPM genérico de procedimiento ciudadano.", "Sol·liciteu suport d'ajuda social municipal. Inicia el flux BPM genèric de procediment ciutadà.", "Udal laguntza sozialaren laguntza eskaera. Herritarren prozedura BPM fluxu orokorra abiarazten du.", "Solicite apoio de axuda social municipal. Inicia o fluxo BPM xenérico de procedemento cidadán.", "Sol·liciteu suport d'ajuda social municipal. Inicia el flux BPM genèric de procediment ciutadà."));
        m.put("cultural-event", locales("Solicite autorización para un evento cultural público. Inicia el flujo BPM genérico de procedimiento ciudadano.", "Sol·liciteu autorització per a un esdeveniment cultural públic. Inicia el flux BPM genèric de procediment ciutadà.", "Ekitaldi kultur publikorako baimena eskaera. Herritarren prozedura BPM fluxu orokorra abiarazten du.", "Solicite autorización para un evento cultural público. Inicia o fluxo BPM xenérico de procedemento cidadán.", "Sol·liciteu autorització per a un esdeveniment cultural públic. Inicia el flux BPM genèric de procediment ciutadà."));
        m.put("tree-pruning", locales("Solicite la poda de árboles en zonas públicas. Inicia el flujo BPM genérico de procedimiento ciudadano.", "Sol·liciteu la poda d'arbres en zones públiques. Inicia el flux BPM genèric de procediment ciutadà.", "Zuhaitzak eremu publikoetan moztea eskaera. Herritarren prozedura BPM fluxu orokorra abiarazten du.", "Solicite a poda de árbores en zonas públicas. Inicia o fluxo BPM xenérico de procedemento cidadán.", "Sol·liciteu la poda d'arbres en zones públiques. Inicia el flux BPM genèric de procediment ciutadà."));
        return Map.copyOf(m);
    }

    // ── Procedure unit translations ──
    private static final java.util.Map<String, java.util.Map<String, String>> PROCEDURE_UNITS = buildProcedureUnits();

    private static java.util.Map<String, java.util.Map<String, String>> buildProcedureUnits() {
        var m = new java.util.HashMap<String, java.util.Map<String, String>>();
        m.put("license-application", locales("Unidad de Licencias", "Unitat de Llicències", "Lizentzia Unitatea", "Unidade de Licenzas", "Unitat de Llicències"));
        m.put("registry-certificate", locales("Oficina del Registro", "Oficina del Registre", "Erregistro Bulegoa", "Oficina do Rexistro", "Oficina del Registre"));
        m.put("address-update", locales("Servicios Ciudadanos", "Serveis Ciutadans", "Herritarren Zerbitzuak", "Servizos Cidadáns", "Serveis Ciutadans"));
        m.put("building-permit", locales("Urbanismo", "Urbanisme", "Hirigintza", "Urbanismo", "Urbanisme"));
        m.put("noise-complaint", locales("Unidad Medioambiental", "Unitat Mediambiental", "Ingurumen Unitatea", "Unidade Medioambiental", "Unitat Mediambiental"));
        m.put("street-occupancy", locales("Oficina de Espacio Público", "Oficina d'Espai Públic", "Espazio Publikoaren Bulegoa", "Oficina de Espazo Público", "Oficina d'Espai Públic"));
        m.put("business-opening", locales("Desarrollo Económico", "Desenvolupament Econòmic", "Garapen Ekonomikoa", "Desenvolvemento Económico", "Desenvolupament Econòmic"));
        m.put("tax-rebate", locales("Oficina Tributaria", "Oficina Tributària", "Zerga Bulegoa", "Oficina Tributaria", "Oficina Tributària"));
        m.put("household-registration", locales("Registro de Población", "Registre de Població", "Biztanleen Erregistroa", "Rexistro de Poboación", "Registre de Població"));
        m.put("social-aid", locales("Servicios Sociales", "Serveis Socials", "Gizarte Zerbitzuak", "Servizos Sociais", "Serveis Socials"));
        m.put("cultural-event", locales("Departamento de Cultura", "Departament de Cultura", "Kultura Saila", "Departamento de Cultura", "Departament de Cultura"));
        m.put("tree-pruning", locales("Parques y Jardines", "Parcs i Jardins", "Parke eta Lorategiak", "Parques e Xardíns", "Parcs i Jardins"));
        return Map.copyOf(m);
    }

    // ── Public content title translations (keyed by Spanish text) ──
    private static final java.util.Map<String, java.util.Map<String, String>> PUBLIC_TITLES = buildPublicTitles();

    private static java.util.Map<String, java.util.Map<String, String>> buildPublicTitles() {
        var m = new java.util.HashMap<String, java.util.Map<String, String>>();
        m.put("Marco de procedimiento administrativo", locales("Marco de procedimiento administrativo", "Marc de procediment administratiu", "Prozedura administratiboaren esparrua", "Marco de procedemento administrativo", "Marc de procediment administratiu"));
        m.put("Esquema Nacional de Seguridad", locales("Esquema Nacional de Seguridad", "Esquema Nacional de Seguretat", "Segurtasunaren Eskema Nazionala", "Esquema Nacional de Seguridade", "Esquema Nacional de Seguretat"));
        m.put("Orden de gestion documental", locales("Orden de gestion documental", "Ordre de gestió documental", "Kudeaketa dokumentalaren agindua", "Orde de xestión documental", "Ordre de gestió documental"));
        m.put("Resolucion de accesibilidad", locales("Resolucion de accesibilidad", "Resolució d'accessibilitat", "Irisgarritasunaren ebazpena", "Resolució d'accessibilitat", "Resolució d'accessibilitat"));
        m.put("General", locales("General", "General", "Orokorra", "Xeral", "General"));
        m.put("Procedimientos", locales("Procedimientos", "Procediments", "Prozedurak", "Procedementos", "Procediments"));
        m.put("Identidad digital", locales("Identidad digital", "Identitat digital", "Identitate digitala", "Identidade digital", "Identitat digital"));
        m.put("Pagos", locales("Pagos", "Pagaments", "Ordainketak", "Pagos", "Pagaments"));
        m.put("Que es la sede electronica?", locales("Que es la sede electronica?", "Que es la seu electrònica?", "Zer da egoitza elektronikoa?", "Que é a seu electrónica?", "Que es la seu electrònica?"));
        m.put("Como inicio un tramite?", locales("Como inicio un tramite?", "Com inicio un tràmit?", "Nola hasi izapide bat?", "Como inicio un trámite?", "Com inicio un tràmit?"));
        m.put("Necesito certificado digital?", locales("Necesito certificado digital?", "Necessito certificat digital?", "Ziurtagiri digitala behar dut?", "Necesito certificado digital?", "Necessito certificat digital?"));
        m.put("Como obtengo justificante de pago?", locales("Como obtengo justificante de pago?", "Com obtinc justificant de pagament?", "Nola lortu ordainketa agiria?", "Como obteño xustificante de pago?", "Com obtinc justificant de pagament?"));
        m.put("Fin de plazo de tasas", locales("Fin de plazo de tasas", "Fi de termini de taxes", "Tasen epe amaiera", "Fin de prazo de taxas", "Fi de termini de taxes"));
        m.put("Festivo local", locales("Festivo local", "Festiu local", "Jai lokal", "Festivo local", "Festiu local"));
        m.put("Sesion informativa digital", locales("Sesion informativa digital", "Sessió informativa digital", "Saio informatibo digitala", "Sessió informativa digital", "Sessió informativa digital"));
        m.put("Recordatorio de subsanacion", locales("Recordatorio de subsanacion", "Recordatori d'esmena", "Zuzenketa gogorarazlea", "Recordatorio de subsanación", "Recordatori d'esmena"));
        m.put("Mision institucional", locales("Mision institucional", "Missió institucional", "Misio instituzionala", "Missió institucional", "Missió institucional"));
        m.put("Estructura organizativa", locales("Estructura organizativa", "Estructura organitzativa", "Antolaketa egitura", "Estructura organizativa", "Estructura organitzativa"));
        m.put("Plaza Mayor 1", locales("Plaza Mayor 1", "Plaça Major 1", "Plaza Nagusia 1", "Praza Maior 1", "Plaça Major 1"));
        m.put("Urbanismo", locales("Urbanismo", "Urbanisme", "Hirigintza", "Urbanismo", "Urbanisme"));
        m.put("Avenida Centro 12", locales("Avenida Centro 12", "Avinguda Centre 12", "Erdigune Etorbidea 12", "Avinguda Centre 12", "Avinguda Centre 12"));
        m.put("Registro General", locales("Registro General", "Registre General", "Erregistro Nagusia", "Rexistro Xeral", "Registre General"));
        m.put("Certificado digital", locales("Certificado digital", "Certificat digital", "Ziurtagiri digitala", "Certificado digital", "Certificat digital"));
        m.put("Expediente", locales("Expediente", "Expedient", "Espedientea", "Expediente", "Expedient"));
        return Map.copyOf(m);
    }

    // ── Public content body translations (keyed by Spanish text) ──
    private static final java.util.Map<String, java.util.Map<String, String>> PUBLIC_BODIES = buildPublicBodies();

    private static java.util.Map<String, java.util.Map<String, String>> buildPublicBodies() {
        var m = new java.util.HashMap<String, java.util.Map<String, String>>();
        m.put("Normativa base de tramitacion electronica municipal.", locales("Normativa base de tramitacion electronica municipal.", "Normativa base de tramitació electrònica municipal.", "Udal tramite elektronikoen oinarrizko araudia.", "Normativa base de tramitación electrónica municipal.", "Normativa base de tramitació electrònica municipal."));
        m.put("Aplicacion del ENS en servicios digitales del ayuntamiento.", locales("Aplicacion del ENS en servicios digitales del ayuntamiento.", "Aplicació de l'ENS en serveis digitals de l'ajuntament.", "ENS udal zerbitzu digitaletan aplikatzea.", "Aplicación do ENS en servizos dixitais do concello.", "Aplicació de l'ENS en serveis digitals de l'ajuntament."));
        m.put("Criterios internos de archivo y conservacion documental.", locales("Criterios internos de archivo y conservacion documental.", "Criteris interns d'arxiu i conservació documental.", "Artxibategi eta dokumentu kontserbazioaren irizpide internoak.", "Criterios internos de arquivo e conservación documental.", "Criteris interns d'arxiu i conservació documental."));
        m.put("Compromiso institucional con WCAG y mejora continua.", locales("Compromiso institucional con WCAG y mejora continua.", "Compromís institucional amb WCAG i millora contínua.", "WCAG eta etengabeko hobekuntzarekin konpromiso instituzionala.", "Compromiso institucional con WCAG e mellora continua.", "Compromís institucional amb WCAG i millora contínua."));
        m.put("Es el canal oficial para tramites, consultas y notificaciones digitales.", locales("Es el canal oficial para tramites, consultas y notificaciones digitales.", "És el canal oficial per a tràmits, consultes i notificacions digitals.", "Tramite, kontsulta eta jakinarazpen digitalen kanal ofiziala da.", "É o canal oficial para trámites, consultas e notificacións dixitais.", "És el canal oficial per a tràmits, consultes i notificacions digitals."));
        m.put("Seleccione el procedimiento y complete el formulario guiado por pasos.", locales("Seleccione el procedimiento y complete el formulario guiado por pasos.", "Seleccioneu el procediment i ompliu el formulari guiat per passos.", "Hautatu prozedura eta urratsez urratseko gidatutako inprimakia bete.", "Seleccione o procedemento e complete o formulario guiado por pasos.", "Seleccioneu el procediment i ompliu el formulari guiat per passos."));
        m.put("Algunos tramites requieren certificado o sistema equivalente de identificacion.", locales("Algunos tramites requieren certificado o sistema equivalente de identificacion.", "Alguns tràmits requereixen certificat o sistema equivalent d'identificació.", "Tramite batzuek ziurtagiria edo baliokideko identifikazio sistema behar dute.", "Algúns trámites requiren certificado ou sistema equivalente d'identificación.", "Alguns tràmits requereixen certificat o sistema equivalent d'identificació."));
        m.put("Al finalizar el pago puede descargar el recibo desde su expediente.", locales("Al finalizar el pago puede descargar el recibo desde su expediente.", "En finalitzar el pagament podeu descarregar el rebut des del vostre expedient.", "Ordainketa amaitzean, agiria deskarga dezakezu zure espedientetik.", "Ao finalizar o pago pode descargar o recibo desde o seu expediente.", "En finalitzar el pagament podeu descarregar el rebut des del vostre expedient."));
        m.put("Fecha limite para tramites con liquidacion de tasas.", locales("Fecha limite para tramites con liquidacion de tasas.", "Data límit per a tràmits amb liquidació de taxes.", "Tasen likidazioa duten tramiteentzako azken data.", "Data límite para trámites con liquidación de taxas.", "Data límit per a tràmits amb liquidació de taxes."));
        m.put("Dia no habil para atencion administrativa presencial.", locales("Dia no habil para atencion administrativa presencial.", "Dia no hàbil per a atenció administrativa presencial.", "Aurrez aurreko arreta administratiborako egun ez-habilitua.", "Día non hábil para atención administrativa presencial.", "Dia no hàbil per a atenció administrativa presencial."));
        m.put("Jornada abierta para resolver dudas sobre tramitacion.", locales("Jornada abierta para resolver dudas sobre tramitacion.", "Jornada oberta per resoldre dubtes sobre tramitació.", "Tramitazioari buruzko zalantzak argitzeko jardunaldi irekia.", "Xornada aberta para resolver dúbides sobre tramitación.", "Jornada oberta per resoldre dubtes sobre tramitació."));
        m.put("Revise expedientes en subsanacion para evitar caducidad.", locales("Revise expedientes en subsanacion para evitar caducidad.", "Reviseu expedients en esmena per evitar caducitat.", "Iraungipena saihesteko zuzenketa dauden espedienteak berrikusi.", "Revise expedientes en subsanación para evitar caducidade.", "Reviseu expedients en esmena per evitar caducitat."));
        m.put("Garantizar una tramitacion digital segura, accesible y orientada al ciudadano.", locales("Garantizar una tramitacion digital segura, accesible y orientada al ciudadano.", "Garantir una tramitació digital segura, accessible i orientada al ciutadà.", "Tramitazio digital seguru, irisgarri eta herritarrei zuzendua bermatzea.", "Garantizar unha tramitación digital segura, accesible e orientada ao cidadán.", "Garantir una tramitació digital segura, accessible i orientada al ciutadà."));
        m.put("Unidades de atencion, tramitacion y soporte coordinadas por sede electronica.", locales("Unidades de atencion, tramitacion y soporte coordinadas por sede electronica.", "Unitats d'atenció, tramitació i suport coordinades per seu electrònica.", "Arreta, tramite eta laguntza unitateak egoitza elektronikoak koordinatuak.", "Unidades de atención, tramitación e soporte coordinadas por seu electrónica.", "Unitats d'atenció, tramitació i suport coordinades per seu electrònica."));
        m.put("Gestion de licencias urbanisticas y disciplina territorial.", locales("Gestion de licencias urbanisticas y disciplina territorial.", "Gestió de llicències urbanístiques i disciplina territorial.", "Lizentzia urbanistikoak eta lurralde diziplina kudeaketa.", "Xestión de llicències urbanístiques i disciplina territorial.", "Gestió de llicències urbanístiques i disciplina territorial."));
        m.put("Atencion al ciudadano para tramites de registro y certificaciones.", locales("Atencion al ciudadano para tramites de registro y certificaciones.", "Atenció al ciutadà per a tràmits de registre i certificacions.", "Herritarren arreta erregistro eta ziurtagirien tramiteetarako.", "Atención al ciudadano para trámites de registro y certificaciones.", "Atenció al ciutadà per a tràmits de registre i certificacions."));
        m.put("Mecanismo de identificacion electronica para firma y autenticacion.", locales("Mecanismo de identificacion electronica para firma y autenticacion.", "Mecanisme d'identificació electrònica per a signatura i autenticació.", "Sinadura eta autentifikaziorako identifikazio elektroniko mekanismoa.", "Mecanismo d'identificación electrònica para firma i autenticación.", "Mecanisme d'identificació electrònica per a signatura i autenticació."));
        m.put("Conjunto de documentos y actuaciones asociadas a un procedimiento.", locales("Conjunto de documentos y actuaciones asociadas a un procedimiento.", "Conjunt de documents i actuacions associades a un procediment.", "Prozedura bati lotutako dokumentu eta ekintzen multzoa.", "Conxunto de documentos i actuacions associades a un procediment.", "Conjunt de documents i actuacions associades a un procediment."));
        return Map.copyOf(m);
    }

    // ── Form field label translations (keyed by field ID) ──
    private static final java.util.Map<String, java.util.Map<String, String>> FIELD_LABELS = buildFieldLabels();

    private static java.util.Map<String, java.util.Map<String, String>> buildFieldLabels() {
        var m = new java.util.HashMap<String, java.util.Map<String, String>>();
        m.put("applicantFullName", locales("Nombre completo", "Nom complet", "Izen-abizenak", "Nome completo", "Nom complet"));
        m.put("applicantEmail", locales("Correo electronico", "Correu electrònic", "Posta elektronikoa", "Correu electrònic", "Correu electrònic"));
        m.put("applicationReason", locales("Motivo de la solicitud", "Motiu de la sol·licitud", "Eskaeraren arrazoia", "Motivo de la sol·licitud", "Motiu de la sol·licitud"));
        m.put("businessName", locales("Nombre de la actividad", "Nom de l'activitat", "Jarduera izena", "Nom de l'activitat", "Nom de l'activitat"));
        m.put("premisesAddress", locales("Direccion del local", "Adreça del local", "Lokalaren helbidea", "Adreça del local", "Adreça del local"));
        m.put("certificateType", locales("Tipo de certificado", "Tipus de certificat", "Ziurtagiri mota", "Tipus de certificat", "Tipus de certificat"));
        m.put("certificatePurpose", locales("Finalidad", "Finalitat", "Helburua", "Finalitat", "Finalitat"));
        m.put("currentAddress", locales("Direccion actual", "Adreça actual", "Uneko helbidea", "Adreça actual", "Adreça actual"));
        m.put("newAddress", locales("Nueva direccion", "Nova adreça", "Helbide berria", "Nova adreça", "Nova adreça"));
        m.put("workType", locales("Tipo de obra", "Tipus d'obra", "Obra mota", "Tipus d'obra", "Tipus d'obra"));
        m.put("plotReference", locales("Referencia catastral", "Referència cadastral", "Erreferentzia katastrala", "Referència cadastral", "Referència cadastral"));
        m.put("incidentAddress", locales("Ubicacion del ruido", "Ubicació del soroll", "Zarata kokapena", "Ubicació del soroll", "Ubicació del soroll"));
        m.put("incidentSchedule", locales("Horario habitual", "Horari habitual", "Ohiko ordutegia", "Horari habitual", "Horari habitual"));
        m.put("occupancyPurpose", locales("Motivo de ocupacion", "Motiu d'ocupació", "Okupazio arrazoia", "Motiu d'ocupació", "Motiu d'ocupació"));
        m.put("occupancyDates", locales("Fechas previstas", "Dates previstes", "Aurreikusitako datak", "Dates previstes", "Dates previstes"));
        m.put("economicActivityCode", locales("Epigrafe de actividad", "Epígraf d'activitat", "Jarduera epigrafea", "Epígraf d'activitat", "Epígraf d'activitat"));
        m.put("openingDate", locales("Fecha prevista de apertura", "Data prevista d'obertura", "Irekiera data aurreikusita", "Data prevista d'obertura", "Data prevista d'obertura"));
        m.put("taxReference", locales("Referencia tributaria", "Referència tributària", "Zerga erreferentzia", "Referència tributària", "Referència tributària"));
        m.put("rebateReason", locales("Causa de la bonificacion", "Causa de la bonificació", "Hobari arrazoia", "Causa de la bonificació", "Causa de la bonificació"));
        m.put("householdMemberName", locales("Nombre del nuevo miembro", "Nom del nou membre", "Kide berriaren izena", "Nom del nou membre", "Nom del nou membre"));
        m.put("relationshipType", locales("Relacion con titular", "Relació amb el titular", "Titularrekin harremana", "Relació amb el titular", "Relació amb el titular"));
        m.put("householdIncomeRange", locales("Rango de ingresos", "Rang d'ingressos", "Diru-sartze tartea", "Rang d'ingressos", "Rang d'ingressos"));
        m.put("householdSize", locales("Numero de convivientes", "Nombre de convivents", "Bizikide kopurua", "Nombre de convivents", "Nombre de convivents"));
        m.put("eventName", locales("Nombre del evento", "Nom de l'esdeveniment", "Ekitaldiaren izena", "Nom de l'esdeveniment", "Nom de l'esdeveniment"));
        m.put("expectedAttendance", locales("Aforo estimado", "Aforament estimat", "Aurreikusitako edukiera", "Aforament estimat", "Aforament estimat"));
        m.put("treeLocation", locales("Ubicacion del arbol", "Ubicació de l'arbre", "Zuhaitzaren kokapena", "Ubicació de l'arbre", "Ubicació de l'arbre"));
        m.put("pruningJustification", locales("Motivo de poda", "Motiu de poda", "Mozketa arrazoia", "Motiu de poda", "Motiu de poda"));
        m.put("procedureSpecificDetails", locales("Detalles especificos de la solicitud", "Detalls específics de la sol·licitud", "Eskaeraren xehetasun espezifikoak", "Detalls específics de la sol·licitud", "Detalls específics de la sol·licitud"));
        return Map.copyOf(m);
    }

    // ── Select option label translations (keyed by option value) ──
    private static final java.util.Map<String, java.util.Map<String, String>> OPTION_LABELS = buildOptionLabels();

    private static java.util.Map<String, java.util.Map<String, String>> buildOptionLabels() {
        var m = new java.util.HashMap<String, java.util.Map<String, String>>();
        // certificateType options
        m.put("padron", locales("Padron", "Padró", "Errolda", "Padró", "Padró"));
        m.put("convivencia", locales("Convivencia", "Convivència", "Bizikidetza", "Convivència", "Convivència"));
        m.put("residencia", locales("Residencia", "Residència", "Egoitza", "Residència", "Residència"));
        // workType options
        m.put("minor", locales("Menor", "Menor", "Txikia", "Menor", "Menor"));
        m.put("major", locales("Mayor", "Major", "Handia", "Major", "Major"));
        m.put("renovation", locales("Reforma", "Reforma", "Erreform", "Reforma", "Reforma"));
        // relationshipType options
        m.put("spouse", locales("Conyuge", "Cònjuge", "Ezkontidea", "Cònjuge", "Cònjuge"));
        m.put("child", locales("Hijo/a", "Fill/a", "Semea/alaba", "Fill/a", "Fill/a"));
        m.put("ward", locales("Tutorado/a", "Tutelat/da", "Tutoretzapekoa", "Tutelat/da", "Tutelat/da"));
        m.put("other", locales("Otro", "Altre", "Beste", "Altre", "Altre"));
        // householdIncomeRange options
        m.put("lt12000", locales("<12000", "<12000", "<12000", "<12000", "<12000"));
        m.put("12000to24000", locales("12000-24000", "12000-24000", "12000-24000", "12000-24000", "12000-24000"));
        m.put("gt24000", locales(">24000", ">24000", ">24000", ">24000", ">24000"));
        return Map.copyOf(m);
    }

    /** Helper: create a locale map from 5 translations (es-ES, ca-ES, eu-ES, gl-ES, va-ES). */
    private static java.util.Map<String, String> locales(String es, String ca, String eu, String gl, String va) {
        return Map.of("es-ES", es, "ca-ES", ca, "eu-ES", eu, "gl-ES", gl, "va-ES", va);
    }

    @Bean
    CommandLineRunner initDevData(PasswordEncoder passwordEncoder,
                                  UserRepository userRepository,
                                  ProcedureTypeRepository procedureTypeRepository,
                                  ProcedureTypeJpaRepository typeJpaRepository,
                                  ProcedureTypeI18nJpaRepository procedureTypeI18nJpaRepository,
                                  ProcedureTaskFieldI18nJpaRepository fieldI18nJpaRepository,
                                  ProcedureTaskJpaRepository taskJpaRepository,
                                  PublicContentEntryJpaRepository publicContentEntryJpaRepository,
                                  ProcedureRepository procedureRepository) {
        return args -> {
            log.info("=== DEV DATA INITIALIZER ===");

            // --- Seed test users ---
            UUID citizenId = UUID.randomUUID();
            User citizen = new User();
            citizen.setId(citizenId);
            citizen.setEmail("citizen@tfg.es");
            citizen.setPasswordHash(passwordEncoder.encode("Citizen1"));
            citizen.setDisplayName("Test Citizen");
            citizen.setRoles(Set.of("ROLE_CITIZEN"));
            citizen.setActive(true);
            userRepository.save(citizen);
            log.info("Created citizen user: citizen@tfg.es / Citizen1");

            UUID adminId = UUID.randomUUID();
            User admin = new User();
            admin.setId(adminId);
            admin.setEmail("admin@tfg.es");
            admin.setPasswordHash(passwordEncoder.encode("Admin1234"));
            admin.setDisplayName("Test Admin");
            admin.setRoles(Set.of("ROLE_ADMIN", "ROLE_CITIZEN"));
            admin.setActive(true);
            userRepository.save(admin);
            log.info("Created admin user: admin@tfg.es / Admin1234");

            // --- Seed procedure types ---
            List<UUID> seededProcedureTypeIds = new ArrayList<>();
            seededProcedureTypeIds.add(seedProcedureType(
                    typeJpaRepository, taskJpaRepository,
                    procedureTypeI18nJpaRepository, fieldI18nJpaRepository,
                    "license-application",
                    new BigDecimal("25.00"),
                    30,
                    "ACTIVE",
                    standardCitizenTasks("license application")
            ));

            seededProcedureTypeIds.add(seedProcedureType(
                    typeJpaRepository, taskJpaRepository,
                    procedureTypeI18nJpaRepository, fieldI18nJpaRepository,
                    "registry-certificate",
                    new BigDecimal("10.00"),
                    15,
                    "ACTIVE",
                    standardCitizenTasks("registry certificate")
            ));

            seededProcedureTypeIds.add(seedProcedureType(
                    typeJpaRepository, taskJpaRepository,
                    procedureTypeI18nJpaRepository, fieldI18nJpaRepository,
                    "address-update",
                    BigDecimal.ZERO,
                    7,
                    "ACTIVE",
                    standardCitizenTasks("address update")
            ));

            seededProcedureTypeIds.add(seedProcedureType(
                    typeJpaRepository, taskJpaRepository,
                    procedureTypeI18nJpaRepository, fieldI18nJpaRepository,
                    "building-permit",
                    new BigDecimal("120.00"),
                    45,
                    "ACTIVE",
                    standardCitizenTasks("building permit")
            ));

            seededProcedureTypeIds.add(seedProcedureType(
                    typeJpaRepository, taskJpaRepository,
                    procedureTypeI18nJpaRepository, fieldI18nJpaRepository,
                    "noise-complaint",
                    BigDecimal.ZERO,
                    20,
                    "ACTIVE",
                    standardCitizenTasks("noise complaint")
            ));

            seededProcedureTypeIds.add(seedProcedureType(
                    typeJpaRepository, taskJpaRepository,
                    procedureTypeI18nJpaRepository, fieldI18nJpaRepository,
                    "street-occupancy",
                    new BigDecimal("35.00"),
                    20,
                    "ACTIVE",
                    standardCitizenTasks("street occupancy authorization")
            ));

            seededProcedureTypeIds.add(seedProcedureType(
                    typeJpaRepository, taskJpaRepository,
                    procedureTypeI18nJpaRepository, fieldI18nJpaRepository,
                    "business-opening",
                    new BigDecimal("80.00"),
                    25,
                    "ACTIVE",
                    standardCitizenTasks("business opening declaration")
            ));

            seededProcedureTypeIds.add(seedProcedureType(
                    typeJpaRepository, taskJpaRepository,
                    procedureTypeI18nJpaRepository, fieldI18nJpaRepository,
                    "tax-rebate",
                    BigDecimal.ZERO,
                    30,
                    "ACTIVE",
                    standardCitizenTasks("tax rebate request")
            ));

            seededProcedureTypeIds.add(seedProcedureType(
                    typeJpaRepository, taskJpaRepository,
                    procedureTypeI18nJpaRepository, fieldI18nJpaRepository,
                    "household-registration",
                    BigDecimal.ZERO,
                    10,
                    "ACTIVE",
                    standardCitizenTasks("household registration")
            ));

            seededProcedureTypeIds.add(seedProcedureType(
                    typeJpaRepository, taskJpaRepository,
                    procedureTypeI18nJpaRepository, fieldI18nJpaRepository,
                    "social-aid",
                    BigDecimal.ZERO,
                    40,
                    "ACTIVE",
                    standardCitizenTasks("social aid application")
            ));

            seededProcedureTypeIds.add(seedProcedureType(
                    typeJpaRepository, taskJpaRepository,
                    procedureTypeI18nJpaRepository, fieldI18nJpaRepository,
                    "cultural-event",
                    new BigDecimal("60.00"),
                    35,
                    "ACTIVE",
                    standardCitizenTasks("cultural event authorization")
            ));

            seededProcedureTypeIds.add(seedProcedureType(
                    typeJpaRepository, taskJpaRepository,
                    procedureTypeI18nJpaRepository, fieldI18nJpaRepository,
                    "tree-pruning",
                    BigDecimal.ZERO,
                    18,
                    "ACTIVE",
                    standardCitizenTasks("tree pruning request")
            ));

            UUID licenseId = seededProcedureTypeIds.get(0);
            UUID registryId = seededProcedureTypeIds.get(1);
            UUID addressId = seededProcedureTypeIds.get(2);

            log.info("Seeded {} procedure types with tasks", seededProcedureTypeIds.size());

            // --- Seed sample cases for the citizen user ---
            Procedure licenseCase = new Procedure();
            licenseCase.setId(UUID.randomUUID());
            licenseCase.setProcedureTypeId(licenseId);
            licenseCase.setOwnerId(citizenId);
            licenseCase.setTitle("License Application");
            licenseCase.setStatus(CaseStatus.DRAFT);
            licenseCase.setSubmittedAt(null);
            procedureRepository.save(licenseCase);
            log.info("Created sample case: License Application (DRAFT)");

            Procedure certificateCase = new Procedure();
            certificateCase.setId(UUID.randomUUID());
            certificateCase.setProcedureTypeId(registryId);
            certificateCase.setOwnerId(citizenId);
            certificateCase.setTitle("Registry Certificate");
            certificateCase.setStatus(CaseStatus.SUBMITTED);
            certificateCase.setSubmittedAt(Instant.now().minusSeconds(86400));
            procedureRepository.save(certificateCase);
            log.info("Created sample case: Registry Certificate (SUBMITTED)");

            Procedure addressCase = new Procedure();
            addressCase.setId(UUID.randomUUID());
            addressCase.setProcedureTypeId(addressId);
            addressCase.setOwnerId(citizenId);
            addressCase.setTitle("Address Update");
            addressCase.setStatus(CaseStatus.AMENDMENT_REQUIRED);
            addressCase.setSubmittedAt(Instant.now().minusSeconds(172800));
            procedureRepository.save(addressCase);
            log.info("Created sample case: Address Update (AMENDMENT_REQUIRED)");

            seedPublicContent(publicContentEntryJpaRepository);

            log.info("=== DEV DATA INITIALIZATION COMPLETE ===");
        };
    }

    private void seedPublicContent(PublicContentEntryJpaRepository repository) {
        if (repository.count() > 0) {
            return;
        }
        List<String> locales = List.of("es-ES", "ca-ES", "eu-ES", "gl-ES", "va-ES");
        Instant now = Instant.now();
        int sortOrder = 0;

        // Legislation entries - shared translationGroupId per content
        UUID legislation1GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("LEGISLATION", locale, legislation1GroupId, null, "law", titleFor(locale, "Marco de procedimiento administrativo"),
                    bodyFor(locale, "Normativa base de tramitacion electronica municipal."), null, "https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565", null, null, sortOrder, true, now));
        }
        sortOrder++;
        
        UUID legislation2GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("LEGISLATION", locale, legislation2GroupId, null, "decree", titleFor(locale, "Esquema Nacional de Seguridad"),
                    bodyFor(locale, "Aplicacion del ENS en servicios digitales del ayuntamiento."), null, "https://www.boe.es/buscar/act.php?id=BOE-A-2022-7191", null, null, sortOrder, true, now));
        }
        sortOrder++;
        
        UUID legislation3GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("LEGISLATION", locale, legislation3GroupId, null, "order", titleFor(locale, "Orden de gestion documental"),
                    bodyFor(locale, "Criterios internos de archivo y conservacion documental."), null, null, null, null, sortOrder, true, now));
        }
        sortOrder++;
        
        UUID legislation4GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("LEGISLATION", locale, legislation4GroupId, null, "resolution", titleFor(locale, "Resolucion de accesibilidad"),
                    bodyFor(locale, "Compromiso institucional con WCAG y mejora continua."), null, null, null, null, sortOrder, true, now));
        }
        sortOrder++;

        // FAQ Categories - shared translationGroupId per category
        UUID faqCat1GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("FAQ_CATEGORY", locale, faqCat1GroupId, "general", null, titleFor(locale, "General"), "", null, null, null, null, 0, true, now));
        }
        
        UUID faqCat2GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("FAQ_CATEGORY", locale, faqCat2GroupId, "procedures", null, titleFor(locale, "Procedimientos"), "", null, null, null, null, 1, true, now));
        }
        
        UUID faqCat3GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("FAQ_CATEGORY", locale, faqCat3GroupId, "certificate", null, titleFor(locale, "Identidad digital"), "", null, null, null, null, 2, true, now));
        }
        
        UUID faqCat4GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("FAQ_CATEGORY", locale, faqCat4GroupId, "payments", null, titleFor(locale, "Pagos"), "", null, null, null, null, 3, true, now));
        }

        // FAQ Entries - shared translationGroupId per entry
        UUID faq1GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("FAQ", locale, faq1GroupId, "general", null, titleFor(locale, "Que es la sede electronica?"),
                    bodyFor(locale, "Es el canal oficial para tramites, consultas y notificaciones digitales."), null, null, null, null, 0, true, now));
        }
        
        UUID faq2GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("FAQ", locale, faq2GroupId, "procedures", null, titleFor(locale, "Como inicio un tramite?"),
                    bodyFor(locale, "Seleccione el procedimiento y complete el formulario guiado por pasos."), null, null, null, null, 1, true, now));
        }
        
        UUID faq3GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("FAQ", locale, faq3GroupId, "certificate", null, titleFor(locale, "Necesito certificado digital?"),
                    bodyFor(locale, "Algunos tramites requieren certificado o sistema equivalente de identificacion."), null, null, null, null, 2, true, now));
        }
        
        UUID faq4GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("FAQ", locale, faq4GroupId, "payments", null, titleFor(locale, "Como obtengo justificante de pago?"),
                    bodyFor(locale, "Al finalizar el pago puede descargar el recibo desde su expediente."), null, null, null, null, 3, true, now));
        }

        // Calendar entries - shared translationGroupId per event
        UUID cal1GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("CALENDAR", locale, cal1GroupId, null, "deadline", titleFor(locale, "Fin de plazo de tasas"),
                    bodyFor(locale, "Fecha limite para tramites con liquidacion de tasas."), java.time.LocalDate.now().plusDays(15), null, null, "tax-payment", 0, true, now));
        }
        
        UUID cal2GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("CALENDAR", locale, cal2GroupId, null, "holiday", titleFor(locale, "Festivo local"),
                    bodyFor(locale, "Dia no habil para atencion administrativa presencial."), java.time.LocalDate.now().plusDays(22), null, null, null, 1, true, now));
        }
        
        UUID cal3GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("CALENDAR", locale, cal3GroupId, null, "info", titleFor(locale, "Sesion informativa digital"),
                    bodyFor(locale, "Jornada abierta para resolver dudas sobre tramitacion."), java.time.LocalDate.now().plusDays(10), null, null, null, 2, true, now));
        }
        
        UUID cal4GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("CALENDAR", locale, cal4GroupId, null, "reminder", titleFor(locale, "Recordatorio de subsanacion"),
                    bodyFor(locale, "Revise expedientes en subsanacion para evitar caducidad."), java.time.LocalDate.now().plusDays(7), null, null, null, 3, true, now));
        }

        // Institutional entries - shared translationGroupId per section
        UUID inst1GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("INSTITUTIONAL", locale, inst1GroupId, "mission", "target", titleFor(locale, "Mision institucional"),
                    bodyFor(locale, "Garantizar una tramitacion digital segura, accesible y orientada al ciudadano."), null, null, null, null, 0, true, now));
        }
        
        UUID inst2GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("INSTITUTIONAL", locale, inst2GroupId, "structure", "building", titleFor(locale, "Estructura organizativa"),
                    bodyFor(locale, "Unidades de atencion, tramitacion y soporte coordinadas por sede electronica."), null, null, null, null, 1, true, now));
        }

        // Organism entries - shared translationGroupId per organism
        UUID org1GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("ORGANISM", locale, org1GroupId, "planning", titleFor(locale, "Plaza Mayor 1"), titleFor(locale, "Urbanismo"),
                    bodyFor(locale, "Gestion de licencias urbanisticas y disciplina territorial."), null, "https://sede.example.org/urbanismo", "urbanismo@ayto.example.org", "900100100", 0, true, now));
        }
        
        UUID org2GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("ORGANISM", locale, org2GroupId, "citizen", titleFor(locale, "Avenida Centro 12"), titleFor(locale, "Registro General"),
                    bodyFor(locale, "Atencion al ciudadano para tramites de registro y certificaciones."), null, "https://sede.example.org/registro", "registro@ayto.example.org", "900100200", 1, true, now));
        }

        // Resource entries - shared translationGroupId per resource
        UUID res1GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("RESOURCE", locale, res1GroupId, null, "glossary", titleFor(locale, "Certificado digital"),
                    bodyFor(locale, "Mecanismo de identificacion electronica para firma y autenticacion."), null, null, null, "FNMT, Cl@ve", 0, true, now));
        }
        
        UUID res2GroupId = UUID.randomUUID();
        for (String locale : locales) {
            repository.save(createPublicContentEntry("RESOURCE", locale, res2GroupId, null, "glossary", titleFor(locale, "Expediente"),
                    bodyFor(locale, "Conjunto de documentos y actuaciones asociadas a un procedimiento."), null, null, null, "Procedimiento, Tramite", 1, true, now));
        }
        
        log.info("Seeded public content base in {} locales", locales.size());
    }

    private PublicContentEntryEntity createPublicContentEntry(String kind,
                                                               String locale,
                                                               UUID translationGroupId,
                                                               String categoryCode,
                                                               String valueType,
                                                               String title,
                                                               String body,
                                                               java.time.LocalDate eventDate,
                                                               String externalUrl,
                                                               String downloadUrl,
                                                               String relatedProcedure,
                                                               int sortOrder,
                                                               boolean published,
                                                               Instant now) {
        PublicContentEntryEntity entity = new PublicContentEntryEntity();
        entity.setId(UUID.randomUUID());
        entity.setTranslationGroupId(translationGroupId != null ? translationGroupId : entity.getId());
        entity.setParentGroupId(null);
        entity.setEntryKind(kind);
        entity.setLocale(locale);
        entity.setCategoryCode(categoryCode);
        entity.setValueType(valueType);
        entity.setTitleText(title);
        entity.setBodyText(body);
        entity.setEventDate(eventDate);
        entity.setExternalUrl(externalUrl);
        entity.setDownloadUrl(downloadUrl);
        entity.setRelatedProcedure(relatedProcedure);
        entity.setSortOrder(sortOrder);
        entity.setPublished(published);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        return entity;
    }

    private String titleFor(String locale, String spanishText) {
        var translations = PUBLIC_TITLES.get(spanishText);
        if (translations != null && translations.containsKey(locale)) {
            return translations.get(locale);
        }
        return spanishText; // fallback to Spanish
    }

    private String bodyFor(String locale, String spanishText) {
        var translations = PUBLIC_BODIES.get(spanishText);
        if (translations != null && translations.containsKey(locale)) {
            return translations.get(locale);
        }
        return spanishText; // fallback to Spanish
    }

    private UUID seedProcedureType(ProcedureTypeJpaRepository typeRepo,
                                   ProcedureTaskJpaRepository taskRepo,
                                   ProcedureTypeI18nJpaRepository i18nRepo,
                                   ProcedureTaskFieldI18nJpaRepository fieldI18nRepo,
                                   String procedureKey,
                                   BigDecimal fee, int deadlineDays,
                                   String status,
                                   List<ProcedureTask> tasks) {
        UUID id = UUID.randomUUID();

        // Base entity uses Spanish (es-ES) as the default locale
        String esTitle = translateProcedureTitle(procedureKey, "es-ES");
        String esDescription = translateProcedureDescription(procedureKey, "es-ES");
        String esUnit = translateProcedureUnit(procedureKey, "es-ES");

        ProcedureTypeEntity entity = new ProcedureTypeEntity();
        entity.setId(id);
        entity.setTitle(esTitle);
        entity.setDescription(esDescription);
        entity.setFeeAmount(fee);
        entity.setDeadlineDays(deadlineDays);
        entity.setStatus(status);
        entity.setUnit(esUnit);
        typeRepo.save(entity);

        for (ProcedureTask task : tasks) {
            ProcedureTaskEntity taskEntity = new ProcedureTaskEntity();
            taskEntity.setId(task.getId());
            taskEntity.setProcedureTypeId(id);
            taskEntity.setType(task.getType());
            taskEntity.setOrderIndex(task.getOrderIndex());
            taskEntity.setTitle(task.getTitle());
            taskEntity.setDescription(task.getDescription());
            taskEntity.setFormSchema(task.getFormSchema());
            taskEntity.setUploadRequirements(task.getUploadRequirements());
            taskRepo.save(taskEntity);
        }

        seedProcedureTranslations(i18nRepo, id, procedureKey);
        seedFormFieldTranslations(fieldI18nRepo, id, tasks);

        log.info("  - Seeded: {} (id: {}) with {} tasks", esTitle, id, tasks.size());
        return id;
    }

    private ProcedureTask createTask(String title, TaskType type, String description, int orderIndex) {
        ProcedureTask task = new ProcedureTask();
        task.setId(UUID.randomUUID());
        task.setTitle(title);
        task.setType(type);
        task.setDescription(description);
        task.setOrderIndex(orderIndex);
        return task;
    }

    private List<ProcedureTask> standardCitizenTasks(String procedureName) {
        ProcedureTask formTask = createTask("Applicant Data", TaskType.FORM, "Provide applicant data for " + procedureName, 0);
        formTask.setFormSchema(defaultFormSchemaJson(procedureName));

        return List.of(
                formTask,
                createTask("Supporting Documents", TaskType.UPLOAD, "Upload required documents for " + procedureName, 1),
                createTask("Confirmation", TaskType.REVIEW, "Review and submit " + procedureName, 2)
        );
    }

    private String defaultFormSchemaJson(String procedureName) {
        String specificFields = specificProcedureFieldsJson(procedureName);
        return """
                [
                  {"id":"applicantFullName","label":"Nombre completo","type":"text","required":true,"options":[]},
                  {"id":"applicantEmail","label":"Correo electronico","type":"text","required":true,"options":[]},
                  {"id":"applicationReason","label":"Motivo de la solicitud","type":"textarea","required":true,"options":[]},
                  %s
                ]
                """.formatted(specificFields);
    }

    private String specificProcedureFieldsJson(String procedureName) {
        return switch (procedureName) {
            case "license application" -> """
                    {"id":"businessName","label":"Nombre de la actividad","type":"text","required":true,"options":[]},
                    {"id":"premisesAddress","label":"Direccion del local","type":"text","required":true,"options":[]}
                    """;
            case "registry certificate" -> """
                    {"id":"certificateType","label":"Tipo de certificado","type":"select","required":true,"options":[{"value":"padron","label":"Padron"},{"value":"convivencia","label":"Convivencia"},{"value":"residencia","label":"Residencia"}]},
                    {"id":"certificatePurpose","label":"Finalidad","type":"textarea","required":false,"options":[]}
                    """;
            case "address update" -> """
                    {"id":"currentAddress","label":"Direccion actual","type":"text","required":true,"options":[]},
                    {"id":"newAddress","label":"Nueva direccion","type":"text","required":true,"options":[]}
                    """;
            case "building permit" -> """
                    {"id":"workType","label":"Tipo de obra","type":"select","required":true,"options":[{"value":"minor","label":"Menor"},{"value":"major","label":"Mayor"},{"value":"renovation","label":"Reforma"}]},
                    {"id":"plotReference","label":"Referencia catastral","type":"text","required":true,"options":[]}
                    """;
            case "noise complaint" -> """
                    {"id":"incidentAddress","label":"Ubicacion del ruido","type":"text","required":true,"options":[]},
                    {"id":"incidentSchedule","label":"Horario habitual","type":"text","required":true,"options":[]}
                    """;
            case "street occupancy authorization" -> """
                    {"id":"occupancyPurpose","label":"Motivo de ocupacion","type":"text","required":true,"options":[]},
                    {"id":"occupancyDates","label":"Fechas previstas","type":"text","required":true,"options":[]}
                    """;
            case "business opening declaration" -> """
                    {"id":"economicActivityCode","label":"Epigrafe de actividad","type":"text","required":true,"options":[]},
                    {"id":"openingDate","label":"Fecha prevista de apertura","type":"text","required":true,"options":[]}
                    """;
            case "tax rebate request" -> """
                    {"id":"taxReference","label":"Referencia tributaria","type":"text","required":true,"options":[]},
                    {"id":"rebateReason","label":"Causa de la bonificacion","type":"textarea","required":true,"options":[]}
                    """;
            case "household registration" -> """
                    {"id":"householdMemberName","label":"Nombre del nuevo miembro","type":"text","required":true,"options":[]},
                    {"id":"relationshipType","label":"Relacion con titular","type":"select","required":true,"options":[{"value":"spouse","label":"Conyuge"},{"value":"child","label":"Hijo/a"},{"value":"ward","label":"Tutorado/a"},{"value":"other","label":"Otro"}]}
                    """;
            case "social aid application" -> """
                    {"id":"householdIncomeRange","label":"Rango de ingresos","type":"select","required":true,"options":[{"value":"lt12000","label":"<12000"},{"value":"12000to24000","label":"12000-24000"},{"value":"gt24000","label":">24000"}]},
                    {"id":"householdSize","label":"Numero de convivientes","type":"text","required":true,"options":[]}
                    """;
            case "cultural event authorization" -> """
                    {"id":"eventName","label":"Nombre del evento","type":"text","required":true,"options":[]},
                    {"id":"expectedAttendance","label":"Aforo estimado","type":"text","required":true,"options":[]}
                    """;
            case "tree pruning request" -> """
                    {"id":"treeLocation","label":"Ubicacion del arbol","type":"text","required":true,"options":[]},
                    {"id":"pruningJustification","label":"Motivo de poda","type":"textarea","required":true,"options":[]}
                    """;
            default -> """
                    {"id":"procedureSpecificDetails","label":"Detalles especificos de la solicitud","type":"textarea","required":false,"options":[]}
                    """;
        };
    }

    private void seedProcedureTranslations(ProcedureTypeI18nJpaRepository i18nRepo,
                                           UUID procedureTypeId,
                                           String procedureKey) {
        List<String> locales = List.of("es-ES", "ca-ES", "eu-ES", "gl-ES", "va-ES");
        for (String locale : locales) {
            ProcedureTypeI18nEntity translation = new ProcedureTypeI18nEntity();
            translation.setId(UUID.randomUUID());
            translation.setProcedureTypeId(procedureTypeId);
            translation.setLocale(locale);
            translation.setTitle(translateProcedureTitle(procedureKey, locale));
            translation.setDescription(translateProcedureDescription(procedureKey, locale));
            translation.setUnit(translateProcedureUnit(procedureKey, locale));
            i18nRepo.save(translation);
        }
    }

    private String translateProcedureTitle(String key, String locale) {
        var translations = PROCEDURE_TITLES.get(key);
        if (translations != null && translations.containsKey(locale)) {
            return translations.get(locale);
        }
        return key; // fallback
    }

    private String translateProcedureDescription(String key, String locale) {
        var translations = PROCEDURE_DESCRIPTIONS.get(key);
        if (translations != null && translations.containsKey(locale)) {
            return translations.get(locale);
        }
        return key; // fallback
    }

    private String translateProcedureUnit(String key, String locale) {
        var translations = PROCEDURE_UNITS.get(key);
        if (translations != null && translations.containsKey(locale)) {
            return translations.get(locale);
        }
        return key; // fallback
    }

    private String translateFieldLabel(String fieldId, String locale) {
        var translations = FIELD_LABELS.get(fieldId);
        if (translations != null && translations.containsKey(locale)) {
            return translations.get(locale);
        }
        return fieldId; // fallback
    }

    private String translateOptionLabel(String optionValue, String locale) {
        var translations = OPTION_LABELS.get(optionValue);
        if (translations != null && translations.containsKey(locale)) {
            return translations.get(locale);
        }
        return optionValue; // fallback
    }

    /**
     * Seed form field translations for all tasks of a procedure type.
     * Parses the formSchema JSON to extract fields and creates i18n entries
     * for each supported locale using translated labels and option values.
     */
    private void seedFormFieldTranslations(ProcedureTaskFieldI18nJpaRepository fieldI18nRepo,
                                           UUID procedureTypeId,
                                           List<ProcedureTask> tasks) {
        List<String> locales = List.of("es-ES", "ca-ES", "eu-ES", "gl-ES", "va-ES");
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

        for (ProcedureTask task : tasks) {
            if (task.getFormSchema() == null || task.getFormSchema().isBlank()) {
                continue;
            }

            try {
                java.util.List<java.util.Map<String, Object>> fields = mapper.readValue(
                        task.getFormSchema(),
                        new com.fasterxml.jackson.core.type.TypeReference<>() {});

                for (java.util.Map<String, Object> field : fields) {
                    String fieldId = (String) field.get("id");
                    String label = (String) field.get("label");
                    String placeholder = (String) field.get("placeholder");
                    Object options = field.get("options");

                    for (String locale : locales) {
                        ProcedureTaskFieldI18nEntity entity = new ProcedureTaskFieldI18nEntity();
                        entity.setId(UUID.randomUUID());
                        entity.setProcedureTypeId(procedureTypeId);
                        entity.setTaskOrderIndex(task.getOrderIndex());
                        entity.setFieldId(fieldId);
                        entity.setLocale(locale);
                        entity.setName(translateFieldLabel(fieldId, locale));
                        entity.setPlaceholder(placeholder != null ? placeholder : "");
                        if (options != null) {
                            entity.setOptionsJson(translateOptionsJson(options, locale, mapper));
                        }
                        fieldI18nRepo.save(entity);
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to seed field i18n for task {}: {}", task.getId(), e.getMessage());
            }
        }
    }

    /**
     * Translate select option labels within a JSON options array.
     */
    private String translateOptionsJson(Object options, String locale,
                                        com.fasterxml.jackson.databind.ObjectMapper mapper) {
        try {
            if (options instanceof java.util.List<?> optionList) {
                java.util.List<java.util.Map<String, Object>> translated = new java.util.ArrayList<>();
                for (Object item : optionList) {
                    if (item instanceof java.util.Map<?, ?> opt) {
                        java.util.Map<String, Object> t = new java.util.LinkedHashMap<>();
                        for (java.util.Map.Entry<?, ?> entry : opt.entrySet()) {
                            String key = entry.getKey().toString();
                            Object value = entry.getValue();
                            if ("label".equals(key) && value instanceof String labelValue) {
                                t.put(key, translateOptionLabel(labelValue, locale));
                            } else {
                                t.put(key, value);
                            }
                        }
                        translated.add(t);
                    }
                }
                return mapper.writeValueAsString(translated);
            }
            return mapper.writeValueAsString(options);
        } catch (Exception e) {
            log.warn("Failed to translate options JSON for locale {}: {}", locale, e.getMessage());
            return "[]";
        }
    }
}
