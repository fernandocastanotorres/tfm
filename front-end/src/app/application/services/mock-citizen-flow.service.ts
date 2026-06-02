import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  ProcedureItem,
  ProcedureDetail,
  ProcedureTaskDto,
  FormFieldDto,
  UploadRequirementDto
} from '../models/procedure.models';
import {
  CaseItem,
  CaseDetail,
  CaseStatusResponse,
  CreateCaseRequest,
  AmendCaseRequest,
  PagedResponse
} from '../models/case.models';

interface StoredMockCase {
  item: CaseItem;
  detail: CaseDetail;
}

/* eslint-disable sonarjs/no-duplicate-string -- Mock data: i18n keys and task names intentionally repeat across procedures */

@Injectable({ providedIn: 'root' })
export class MockCitizenFlowService {
  private readonly casesKey = 'tfg.mock.cases';
  private readonly latencyMs = 180;

  private static formField(id: string, name: string, type: string, placeholder: string, required: boolean = true, options?: FormFieldDto['options']): FormFieldDto {
    const field: FormFieldDto = { id, name, type, required, placeholder };
    if (options) field.options = options;
    return field;
  }

  private static uploadReq(id: string, name: string, required: boolean = true): UploadRequirementDto {
    return { id, name, required };
  }

  private static task(title: string, type: 'form' | 'upload' | 'review', description: string, formFields?: FormFieldDto[], uploadRequirements?: UploadRequirementDto[]): ProcedureTaskDto {
    const task: ProcedureTaskDto = {
      id: `task-${Math.random().toString(36).slice(2, 10)}`,
      name: title,
      type,
      description,
    };
    if (formFields) task.formFields = formFields;
    if (uploadRequirements) task.uploadRequirements = uploadRequirements;
    return task;
  }

  private readonly procedures: ProcedureDetail[] = [
    {
      id: 'mock-license-application',
      slug: 'solicitud-de-licencia',
      name: 'Solicitud de Licencia',
      description: 'Solicite una licencia para nueva actividad o negocio. Inicia el flujo BPM genérico de procedimiento ciudadano.',
      category: 'Unidad de Licencias',
      fee: 25,
      deadline: 30,
      status: 'AVAILABLE',
      tasks: [
        {
          id: 'task-0-license',
          name: 'Datos del solicitante',
          type: 'form',
          description: 'Proporcione los datos del solicitante para la licencia.',
          formFields: [
            MockCitizenFlowService.formField('applicantFullName', 'CASE_WIZARD.FIELD_FULL_NAME', 'text', 'CASE_WIZARD.FIELD_FULL_NAME_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicantEmail', 'CASE_WIZARD.FIELD_CONTACT_EMAIL', 'email', 'CASE_WIZARD.FIELD_CONTACT_EMAIL_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicationReason', 'CASE_WIZARD.FIELD_APPLICATION_REASON', 'textarea', 'CASE_WIZARD.FIELD_APPLICATION_REASON_PLACEHOLDER'),
            MockCitizenFlowService.formField('businessName', 'CASE_WIZARD.FIELD_BUSINESS_NAME', 'text', 'CASE_WIZARD.FIELD_BUSINESS_NAME_PLACEHOLDER'),
            MockCitizenFlowService.formField('premisesAddress', 'CASE_WIZARD.FIELD_PREMISES_ADDRESS', 'text', 'CASE_WIZARD.FIELD_PREMISES_ADDRESS_PLACEHOLDER')
          ]
        },
        {
          id: 'task-1-license',
          name: 'Documentación obligatoria',
          type: 'upload',
          description: 'Adjunte la documentación mínima exigida para iniciar el expediente.',
          uploadRequirements: [
            MockCitizenFlowService.uploadReq('doc-id', 'CASE_WIZARD.UPLOAD_ID'),
            MockCitizenFlowService.uploadReq('doc-license', 'CASE_WIZARD.UPLOAD_LICENSE_DOCS')
          ]
        },
        {
          id: 'task-2-license',
          name: 'Revisión y envío',
          type: 'review',
          description: 'Revise toda la información antes de registrar la solicitud.'
        }
      ]
    },
    {
      id: 'mock-registry-certificate',
      slug: 'certificado-registral',
      name: 'Certificado Registral',
      description: 'Solicite un certificado registral oficial. Inicia el flujo BPM genérico de procedimiento ciudadano.',
      category: 'Oficina del Registro',
      fee: 10,
      deadline: 15,
      status: 'AVAILABLE',
      tasks: [
        {
          id: 'task-0-registry',
          name: 'Datos del solicitante',
          type: 'form',
          description: 'Proporcione los datos para el certificado registral.',
          formFields: [
            MockCitizenFlowService.formField('applicantFullName', 'CASE_WIZARD.FIELD_FULL_NAME', 'text', 'CASE_WIZARD.FIELD_FULL_NAME_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicantEmail', 'CASE_WIZARD.FIELD_CONTACT_EMAIL', 'email', 'CASE_WIZARD.FIELD_CONTACT_EMAIL_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicationReason', 'CASE_WIZARD.FIELD_APPLICATION_REASON', 'textarea', 'CASE_WIZARD.FIELD_APPLICATION_REASON_PLACEHOLDER'),
            MockCitizenFlowService.formField('certificateType', 'CASE_WIZARD.FIELD_CERTIFICATE_TYPE', 'select', 'CASE_WIZARD.FIELD_CERTIFICATE_TYPE_PLACEHOLDER', true, [
              { value: 'padron', label: 'CASE_WIZARD.CERT_TYPE_PADRON' },
              { value: 'convivencia', label: 'CASE_WIZARD.CERT_TYPE_CONVIVENCIA' },
              { value: 'residencia', label: 'CASE_WIZARD.CERT_TYPE_RESIDENCIA' }
            ]),
            MockCitizenFlowService.formField('certificatePurpose', 'CASE_WIZARD.FIELD_CERTIFICATE_PURPOSE', 'textarea', 'CASE_WIZARD.FIELD_CERTIFICATE_PURPOSE_PLACEHOLDER', false)
          ]
        },
        {
          id: 'task-1-registry',
          name: 'Documentación acreditativa',
          type: 'upload',
          description: 'Adjunte la documentación de identidad y domicilio.',
          uploadRequirements: [
            MockCitizenFlowService.uploadReq('doc-id', 'CASE_WIZARD.UPLOAD_ID'),
            MockCitizenFlowService.uploadReq('doc-address', 'CASE_WIZARD.UPLOAD_ADDRESS_PROOF')
          ]
        },
        {
          id: 'task-2-registry',
          name: 'Revisión y envío',
          type: 'review',
          description: 'Confirma la solicitud para emitir el certificado.'
        }
      ]
    },
    {
      id: 'mock-address-update',
      slug: 'actualizacion-de-domicilio',
      name: 'Actualización de Domicilio',
      description: 'Actualice su domicilio registrado. Inicia el flujo BPM genérico de procedimiento ciudadano.',
      category: 'Servicios Citizens',
      fee: 0,
      deadline: 7,
      status: 'AVAILABLE',
      tasks: [
        {
          id: 'task-0-address',
          name: 'Datos de domicilio',
          type: 'form',
          description: 'Indique el domicilio actual y el nuevo.',
          formFields: [
            MockCitizenFlowService.formField('applicantFullName', 'CASE_WIZARD.FIELD_FULL_NAME', 'text', 'CASE_WIZARD.FIELD_FULL_NAME_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicantEmail', 'CASE_WIZARD.FIELD_CONTACT_EMAIL', 'email', 'CASE_WIZARD.FIELD_CONTACT_EMAIL_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicationReason', 'CASE_WIZARD.FIELD_APPLICATION_REASON', 'textarea', 'CASE_WIZARD.FIELD_APPLICATION_REASON_PLACEHOLDER'),
            MockCitizenFlowService.formField('currentAddress', 'CASE_WIZARD.FIELD_CURRENT_ADDRESS', 'text', 'CASE_WIZARD.FIELD_CURRENT_ADDRESS_PLACEHOLDER'),
            MockCitizenFlowService.formField('newAddress', 'CASE_WIZARD.FIELD_NEW_ADDRESS', 'text', 'CASE_WIZARD.FIELD_NEW_ADDRESS_PLACEHOLDER')
          ]
        },
        {
          id: 'task-1-address',
          name: 'Documentación acreditativa',
          type: 'upload',
          description: 'Adjunte la documentación de identidad y domicilio.',
          uploadRequirements: [
            MockCitizenFlowService.uploadReq('doc-id', 'CASE_WIZARD.UPLOAD_ID'),
            MockCitizenFlowService.uploadReq('doc-address', 'CASE_WIZARD.UPLOAD_ADDRESS_PROOF')
          ]
        },
        {
          id: 'task-2-address',
          name: 'Revisión y envío',
          type: 'review',
          description: 'Verifica los datos del alta antes de finalizar.'
        }
      ]
    },
    {
      id: 'mock-building-permit',
      slug: 'licencia-de-obra',
      name: 'Licencia de Obra',
      description: 'Solicite una licencia municipal de obra. Inicia el flujo BPM genérico de procedimiento ciudadano.',
      category: 'Urbanismo',
      fee: 120,
      deadline: 45,
      status: 'AVAILABLE',
      tasks: [
        {
          id: 'task-0-building',
          name: 'Datos de la obra',
          type: 'form',
          description: 'Indique el tipo de obra y reference catastral.',
          formFields: [
            MockCitizenFlowService.formField('applicantFullName', 'CASE_WIZARD.FIELD_FULL_NAME', 'text', 'CASE_WIZARD.FIELD_FULL_NAME_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicantEmail', 'CASE_WIZARD.FIELD_CONTACT_EMAIL', 'email', 'CASE_WIZARD.FIELD_CONTACT_EMAIL_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicationReason', 'CASE_WIZARD.FIELD_APPLICATION_REASON', 'textarea', 'CASE_WIZARD.FIELD_APPLICATION_REASON_PLACEHOLDER'),
            MockCitizenFlowService.formField('workType', 'CASE_WIZARD.FIELD_WORK_TYPE', 'select', 'CASE_WIZARD.FIELD_WORK_TYPE_PLACEHOLDER', true, [
              { value: 'minor', label: 'CASE_WIZARD.WORK_TYPE_MINOR' },
              { value: 'major', label: 'CASE_WIZARD.WORK_TYPE_MAJOR' },
              { value: 'renovation', label: 'CASE_WIZARD.WORK_TYPE_RENOVATION' }
            ]),
            MockCitizenFlowService.formField('plotReference', 'CASE_WIZARD.FIELD_PLOT_REFERENCE', 'text', 'CASE_WIZARD.FIELD_PLOT_REFERENCE_PLACEHOLDER')
          ]
        },
        {
          id: 'task-1-building',
          name: 'Documentación técnica',
          type: 'upload',
          description: 'Adjunte la documentación técnica necesaria.',
          uploadRequirements: [
            MockCitizenFlowService.uploadReq('doc-id', 'CASE_WIZARD.UPLOAD_ID'),
            MockCitizenFlowService.uploadReq('doc-project', 'CASE_WIZARD.UPLOAD_PROJECT_DOCS'),
            MockCitizenFlowService.uploadReq('doc-technical', 'CASE_WIZARD.UPLOAD_TECHNICAL_DOCS')
          ]
        },
        {
          id: 'task-2-building',
          name: 'Revisión y envío',
          type: 'review',
          description: 'Revise toda la información antes de registrar la solicitud.'
        }
      ]
    },
    {
      id: 'mock-noise-complaint',
      slug: 'denuncia-por-ruidos',
      name: 'Denuncia por Ruidos',
      description: 'Denuncie incidentes recurrentes de ruido para inspección municipal. Inicia el flujo BPM genérico de procedimiento ciudadano.',
      category: 'Unidad Medioambiental',
      fee: 0,
      deadline: 20,
      status: 'AVAILABLE',
      tasks: [
        {
          id: 'task-0-noise',
          name: 'Datos de la denuncia',
          type: 'form',
          description: 'Indique la ubicación del ruido y el horario habitual.',
          formFields: [
            MockCitizenFlowService.formField('applicantFullName', 'CASE_WIZARD.FIELD_FULL_NAME', 'text', 'CASE_WIZARD.FIELD_FULL_NAME_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicantEmail', 'CASE_WIZARD.FIELD_CONTACT_EMAIL', 'email', 'CASE_WIZARD.FIELD_CONTACT_EMAIL_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicationReason', 'CASE_WIZARD.FIELD_APPLICATION_REASON', 'textarea', 'CASE_WIZARD.FIELD_APPLICATION_REASON_PLACEHOLDER'),
            MockCitizenFlowService.formField('incidentAddress', 'CASE_WIZARD.FIELD_INCIDENT_ADDRESS', 'text', 'CASE_WIZARD.FIELD_INCIDENT_ADDRESS_PLACEHOLDER'),
            MockCitizenFlowService.formField('incidentSchedule', 'CASE_WIZARD.FIELD_INCIDENT_SCHEDULE', 'text', 'CASE_WIZARD.FIELD_INCIDENT_SCHEDULE_PLACEHOLDER')
          ]
        },
        {
          id: 'task-1-noise',
          name: 'Pruebas de la denuncia',
          type: 'upload',
          description: 'Adjunte pruebas文档 (fotos, grabaciones, etc.) si dispone.',
          uploadRequirements: [
            MockCitizenFlowService.uploadReq('doc-evidence', 'CASE_WIZARD.UPLOAD_EVIDENCE', false)
          ]
        },
        {
          id: 'task-2-noise',
          name: 'Revisión y envío',
          type: 'review',
          description: 'Revise toda la información antes de registrar la denuncia.'
        }
      ]
    },
    {
      id: 'mock-street-occupancy',
      slug: 'autorizacion-de-ocupacion-de-via-publica',
      name: 'Autorización de Ocupación de Vía Pública',
      description: 'Solicite autorización para ocupar temporalmente espacio público. Inicia el flujo BPM genérico de procedimiento ciudadano.',
      category: 'Oficina de Espacio Público',
      fee: 35,
      deadline: 20,
      status: 'AVAILABLE',
      tasks: [
        {
          id: 'task-0-occupancy',
          name: 'Datos de ocupación',
          type: 'form',
          description: 'Indique el motivo y fechas previstas de ocupación.',
          formFields: [
            MockCitizenFlowService.formField('applicantFullName', 'CASE_WIZARD.FIELD_FULL_NAME', 'text', 'CASE_WIZARD.FIELD_FULL_NAME_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicantEmail', 'CASE_WIZARD.FIELD_CONTACT_EMAIL', 'email', 'CASE_WIZARD.FIELD_CONTACT_EMAIL_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicationReason', 'CASE_WIZARD.FIELD_APPLICATION_REASON', 'textarea', 'CASE_WIZARD.FIELD_APPLICATION_REASON_PLACEHOLDER'),
            MockCitizenFlowService.formField('occupancyPurpose', 'CASE_WIZARD.FIELD_OCCUPANCY_PURPOSE', 'text', 'CASE_WIZARD.FIELD_OCCUPANCY_PURPOSE_PLACEHOLDER'),
            MockCitizenFlowService.formField('occupancyDates', 'CASE_WIZARD.FIELD_OCCUPANCY_DATES', 'text', 'CASE_WIZARD.FIELD_OCCUPANCY_DATES_PLACEHOLDER')
          ]
        },
        {
          id: 'task-1-occupancy',
          name: 'Documentación',
          type: 'upload',
          description: 'Adjunte la documentación necesaria.',
          uploadRequirements: [
            MockCitizenFlowService.uploadReq('doc-id', 'CASE_WIZARD.UPLOAD_ID'),
            MockCitizenFlowService.uploadReq('doc-layout', 'CASE_WIZARD.UPLOAD_LAYOUT_DOCS')
          ]
        },
        {
          id: 'task-2-occupancy',
          name: 'Revisión y envío',
          type: 'review',
          description: 'Revise toda la información antes de registrar la solicitud.'
        }
      ]
    },
    {
      id: 'mock-business-opening',
      slug: 'declaracion-de-apertura-de-negocio',
      name: 'Declaración de Apertura de Negocio',
      description: 'Presente una declaración para abrir una actividad comercial. Inicia el flujo BPM genérico de procedimiento ciudadano.',
      category: 'Desarrollo Económico',
      fee: 80,
      deadline: 25,
      status: 'AVAILABLE',
      tasks: [
        {
          id: 'task-0-business',
          name: 'Datos de la actividad',
          type: 'form',
          description: 'Indique el epígrafe de actividad y fecha prevista de apertura.',
          formFields: [
            MockCitizenFlowService.formField('applicantFullName', 'CASE_WIZARD.FIELD_FULL_NAME', 'text', 'CASE_WIZARD.FIELD_FULL_NAME_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicantEmail', 'CASE_WIZARD.FIELD_CONTACT_EMAIL', 'email', 'CASE_WIZARD.FIELD_CONTACT_EMAIL_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicationReason', 'CASE_WIZARD.FIELD_APPLICATION_REASON', 'textarea', 'CASE_WIZARD.FIELD_APPLICATION_REASON_PLACEHOLDER'),
            MockCitizenFlowService.formField('economicActivityCode', 'CASE_WIZARD.FIELD_ECONOMIC_ACTIVITY_CODE', 'text', 'CASE_WIZARD.FIELD_ECONOMIC_ACTIVITY_CODE_PLACEHOLDER'),
            MockCitizenFlowService.formField('openingDate', 'CASE_WIZARD.FIELD_OPENING_DATE', 'text', 'CASE_WIZARD.FIELD_OPENING_DATE_PLACEHOLDER')
          ]
        },
        {
          id: 'task-1-business',
          name: 'Documentación de la actividad',
          type: 'upload',
          description: 'Adjunte la documentación necesaria para la apertura.',
          uploadRequirements: [
            MockCitizenFlowService.uploadReq('doc-id', 'CASE_WIZARD.UPLOAD_ID'),
            MockCitizenFlowService.uploadReq('doc-activity', 'CASE_WIZARD.UPLOAD_ACTIVITY_DOCS')
          ]
        },
        {
          id: 'task-2-business',
          name: 'Revisión y envío',
          type: 'review',
          description: 'Revise toda la información antes de registrar la declaración.'
        }
      ]
    },
    {
      id: 'mock-tax-rebate',
      slug: 'solicitud-de-bonificacion-fiscal',
      name: 'Solicitud de Bonificación Fiscal',
      description: 'Solicite una bonificación fiscal municipal por circunstancias elegibles. Inicia el flujo BPM genérico de procedimiento ciudadano.',
      category: 'Oficina Tributaria',
      fee: 0,
      deadline: 30,
      status: 'AVAILABLE',
      tasks: [
        {
          id: 'task-0-tax',
          name: 'Datos de la bonificación',
          type: 'form',
          description: 'Indique la referencia tributaria y causa de la bonificación.',
          formFields: [
            MockCitizenFlowService.formField('applicantFullName', 'CASE_WIZARD.FIELD_FULL_NAME', 'text', 'CASE_WIZARD.FIELD_FULL_NAME_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicantEmail', 'CASE_WIZARD.FIELD_CONTACT_EMAIL', 'email', 'CASE_WIZARD.FIELD_CONTACT_EMAIL_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicationReason', 'CASE_WIZARD.FIELD_APPLICATION_REASON', 'textarea', 'CASE_WIZARD.FIELD_APPLICATION_REASON_PLACEHOLDER'),
            MockCitizenFlowService.formField('taxReference', 'CASE_WIZARD.FIELD_TAX_REFERENCE', 'text', 'CASE_WIZARD.FIELD_TAX_REFERENCE_PLACEHOLDER'),
            MockCitizenFlowService.formField('rebateReason', 'CASE_WIZARD.FIELD_REBATE_REASON', 'textarea', 'CASE_WIZARD.FIELD_REBATE_REASON_PLACEHOLDER')
          ]
        },
        {
          id: 'task-1-tax',
          name: 'Documentación acreditativa',
          type: 'upload',
          description: 'Adjunte la documentación que acredite los requisitos.',
          uploadRequirements: [
            MockCitizenFlowService.uploadReq('doc-id', 'CASE_WIZARD.UPLOAD_ID'),
            MockCitizenFlowService.uploadReq('doc-income', 'CASE_WIZARD.UPLOAD_INCOME_DOCS', false)
          ]
        },
        {
          id: 'task-2-tax',
          name: 'Revisión y envío',
          type: 'review',
          description: 'Revise toda la información antes de registrar la solicitud.'
        }
      ]
    },
    {
      id: 'mock-household-registration',
      slug: 'empadronamiento-de-familiar',
      name: 'Empadronamiento de Familiar',
      description: 'Registre un familiar en un domicilio municipal. Inicia el flujo BPM genérico de procedimiento ciudadano.',
      category: 'Registro de Población',
      fee: 0,
      deadline: 10,
      status: 'AVAILABLE',
      tasks: [
        {
          id: 'task-0-household',
          name: 'Datos del familiar',
          type: 'form',
          description: 'Indique el nombre del nuevo miembro y su relación con el titular.',
          formFields: [
            MockCitizenFlowService.formField('applicantFullName', 'CASE_WIZARD.FIELD_FULL_NAME', 'text', 'CASE_WIZARD.FIELD_FULL_NAME_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicantEmail', 'CASE_WIZARD.FIELD_CONTACT_EMAIL', 'email', 'CASE_WIZARD.FIELD_CONTACT_EMAIL_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicationReason', 'CASE_WIZARD.FIELD_APPLICATION_REASON', 'textarea', 'CASE_WIZARD.FIELD_APPLICATION_REASON_PLACEHOLDER'),
            MockCitizenFlowService.formField('householdMemberName', 'CASE_WIZARD.FIELD_HOUSEHOLD_MEMBER_NAME', 'text', 'CASE_WIZARD.FIELD_HOUSEHOLD_MEMBER_NAME_PLACEHOLDER'),
            MockCitizenFlowService.formField('relationshipType', 'CASE_WIZARD.FIELD_RELATIONSHIP_TYPE', 'select', 'CASE_WIZARD.FIELD_RELATIONSHIP_TYPE_PLACEHOLDER', true, [
              { value: 'spouse', label: 'CASE_WIZARD.RELATIONSHIP_SPOUSE' },
              { value: 'child', label: 'CASE_WIZARD.RELATIONSHIP_CHILD' },
              { value: 'ward', label: 'CASE_WIZARD.RELATIONSHIP_WARD' },
              { value: 'other', label: 'CASE_WIZARD.RELATIONSHIP_OTHER' }
            ])
          ]
        },
        {
          id: 'task-1-household',
          name: 'Documentación acreditativa',
          type: 'upload',
          description: 'Adjunte la documentación de identidad y parentesco.',
          uploadRequirements: [
            MockCitizenFlowService.uploadReq('doc-id-holder', 'CASE_WIZARD.UPLOAD_HOLDER_ID'),
            MockCitizenFlowService.uploadReq('doc-id-member', 'CASE_WIZARD.UPLOAD_MEMBER_ID'),
            MockCitizenFlowService.uploadReq('doc-relationship', 'CASE_WIZARD.UPLOAD_RELATIONSHIP_DOCS')
          ]
        },
        {
          id: 'task-2-household',
          name: 'Revisión y envío',
          type: 'review',
          description: 'Verifica los datos del alta antes de finalizar.'
        }
      ]
    },
    {
      id: 'mock-social-aid',
      slug: 'solicitud-de-ayuda-social',
      name: 'Solicitud de Ayuda Social',
      description: 'Solicite apoyo de ayuda social municipal. Inicia el flujo BPM genérico de procedimiento ciudadano.',
      category: 'Servicios Sociales',
      fee: 0,
      deadline: 40,
      status: 'AVAILABLE',
      tasks: [
        {
          id: 'task-0-social',
          name: 'Datos económicos',
          type: 'form',
          description: 'Indique el rango de ingresos y número de convivientes.',
          formFields: [
            MockCitizenFlowService.formField('applicantFullName', 'CASE_WIZARD.FIELD_FULL_NAME', 'text', 'CASE_WIZARD.FIELD_FULL_NAME_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicantEmail', 'CASE_WIZARD.FIELD_CONTACT_EMAIL', 'email', 'CASE_WIZARD.FIELD_CONTACT_EMAIL_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicationReason', 'CASE_WIZARD.FIELD_APPLICATION_REASON', 'textarea', 'CASE_WIZARD.FIELD_APPLICATION_REASON_PLACEHOLDER'),
            MockCitizenFlowService.formField('householdIncomeRange', 'CASE_WIZARD.FIELD_HOUSEHOLD_INCOME_RANGE', 'select', 'CASE_WIZARD.FIELD_HOUSEHOLD_INCOME_RANGE_PLACEHOLDER', true, [
              { value: 'lt12000', label: 'CASE_WIZARD.INCOME_LT_12000' },
              { value: '12000to24000', label: 'CASE_WIZARD.INCOME_12000_TO_24000' },
              { value: 'gt24000', label: 'CASE_WIZARD.INCOME_GT_24000' }
            ]),
            MockCitizenFlowService.formField('householdSize', 'CASE_WIZARD.FIELD_HOUSEHOLD_SIZE', 'text', 'CASE_WIZARD.FIELD_HOUSEHOLD_SIZE_PLACEHOLDER')
          ]
        },
        {
          id: 'task-1-social',
          name: 'Documentación de ingresos',
          type: 'upload',
          description: 'Adjunte la documentación que acredite los ingresos.',
          uploadRequirements: [
            MockCitizenFlowService.uploadReq('doc-id', 'CASE_WIZARD.UPLOAD_ID'),
            MockCitizenFlowService.uploadReq('doc-income', 'CASE_WIZARD.UPLOAD_INCOME_DOCS')
          ]
        },
        {
          id: 'task-2-social',
          name: 'Revisión y envío',
          type: 'review',
          description: 'Revise toda la información antes de registrar la solicitud.'
        }
      ]
    },
    {
      id: 'mock-cultural-event',
      slug: 'autorizacion-de-evento-cultural',
      name: 'Autorización de Evento Cultural',
      description: 'Solicite autorización para un evento cultural público. Inicia el flujo BPM genérico de procedimiento ciudadano.',
      category: 'Departamento de Cultura',
      fee: 60,
      deadline: 35,
      status: 'AVAILABLE',
      tasks: [
        {
          id: 'task-0-cultural',
          name: 'Datos del evento',
          type: 'form',
          description: 'Indique el nombre del evento y el aforo estimado.',
          formFields: [
            MockCitizenFlowService.formField('applicantFullName', 'CASE_WIZARD.FIELD_FULL_NAME', 'text', 'CASE_WIZARD.FIELD_FULL_NAME_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicantEmail', 'CASE_WIZARD.FIELD_CONTACT_EMAIL', 'email', 'CASE_WIZARD.FIELD_CONTACT_EMAIL_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicationReason', 'CASE_WIZARD.FIELD_APPLICATION_REASON', 'textarea', 'CASE_WIZARD.FIELD_APPLICATION_REASON_PLACEHOLDER'),
            MockCitizenFlowService.formField('eventName', 'CASE_WIZARD.FIELD_EVENT_NAME', 'text', 'CASE_WIZARD.FIELD_EVENT_NAME_PLACEHOLDER'),
            MockCitizenFlowService.formField('expectedAttendance', 'CASE_WIZARD.FIELD_EXPECTED_ATTENDANCE', 'text', 'CASE_WIZARD.FIELD_EXPECTED_ATTENDANCE_PLACEHOLDER')
          ]
        },
        {
          id: 'task-1-cultural',
          name: 'Documentación del evento',
          type: 'upload',
          description: 'Adjunte la documentación del evento cultural.',
          uploadRequirements: [
            MockCitizenFlowService.uploadReq('doc-id', 'CASE_WIZARD.UPLOAD_ID'),
            MockCitizenFlowService.uploadReq('doc-event', 'CASE_WIZARD.UPLOAD_EVENT_DOCS')
          ]
        },
        {
          id: 'task-2-cultural',
          name: 'Revisión y envío',
          type: 'review',
          description: 'Revise toda la información antes de registrar la solicitud.'
        }
      ]
    },
    {
      id: 'mock-tree-pruning',
      slug: 'solicitud-de-poda-de-arboles',
      name: 'Solicitud de Poda de Árboles',
      description: 'Solicite la poda de árboles en zonas públicas. Inicia el flujo BPM genérico de procedimiento ciudadano.',
      category: 'Parques y Jardines',
      fee: 0,
      deadline: 18,
      status: 'AVAILABLE',
      tasks: [
        {
          id: 'task-0-tree',
          name: 'Datos del árbol',
          type: 'form',
          description: 'Indique la ubicación del árbol y motivo de la poda.',
          formFields: [
            MockCitizenFlowService.formField('applicantFullName', 'CASE_WIZARD.FIELD_FULL_NAME', 'text', 'CASE_WIZARD.FIELD_FULL_NAME_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicantEmail', 'CASE_WIZARD.FIELD_CONTACT_EMAIL', 'email', 'CASE_WIZARD.FIELD_CONTACT_EMAIL_PLACEHOLDER'),
            MockCitizenFlowService.formField('applicationReason', 'CASE_WIZARD.FIELD_APPLICATION_REASON', 'textarea', 'CASE_WIZARD.FIELD_APPLICATION_REASON_PLACEHOLDER'),
            MockCitizenFlowService.formField('treeLocation', 'CASE_WIZARD.FIELD_TREE_LOCATION', 'text', 'CASE_WIZARD.FIELD_TREE_LOCATION_PLACEHOLDER'),
            MockCitizenFlowService.formField('pruningJustification', 'CASE_WIZARD.FIELD_PRUNING_JUSTIFICATION', 'textarea', 'CASE_WIZARD.FIELD_PRUNING_JUSTIFICATION_PLACEHOLDER')
          ]
        },
        {
          id: 'task-1-tree',
          name: 'Documentación gráfica',
          type: 'upload',
          description: 'Adjunte fotografías del árbol si dispone.',
          uploadRequirements: [
            MockCitizenFlowService.uploadReq('doc-photos', 'CASE_WIZARD.UPLOAD_TREE_PHOTOS', false)
          ]
        },
        {
          id: 'task-2-tree',
          name: 'Revisión y envío',
          type: 'review',
          description: 'Revise toda la información antes de registrar la solicitud.'
        }
      ]
    }
  ];

  listProcedures(): Observable<ProcedureItem[]> {
    return of(this.procedures.map((p) => this.toItem(p))).pipe(delay(this.latencyMs));
  }

  getProcedureBySlug(slug: string): Observable<ProcedureDetail> {
    const found = this.procedures.find((p) => p.slug === slug);
    if (!found) {
      throw new Error(`Procedure not found for slug: ${slug}`);
    }
    return of(found).pipe(delay(this.latencyMs));
  }

  getFormSchema(slug: string): Observable<ProcedureTaskDto[]> {
    const found = this.procedures.find((p) => p.slug === slug);
    return of(found?.tasks ?? []).pipe(delay(this.latencyMs));
  }

  getTaskSchema(slug: string, taskId: string): Observable<ProcedureTaskDto> {
    const found = this.procedures.find((p) => p.slug === slug);
    const task = found?.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    return of(task).pipe(delay(this.latencyMs));
  }

  listCases(page: number = 0, size: number = 10): Observable<PagedResponse<CaseItem>> {
    const stored = this.readCases();
    const items = stored.map((s) => s.item).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = page * size;
    const pageItems = items.slice(start, start + size);
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / size));

    return of({
      items: pageItems,
      page,
      size,
      totalItems,
      totalPages
    }).pipe(delay(this.latencyMs));
  }

  getCaseDetail(id: string): Observable<CaseDetail> {
    const found = this.readCases().find((c) => c.item.id === id);
    if (!found) {
      throw new Error(`Case not found: ${id}`);
    }
    return of(found.detail).pipe(delay(this.latencyMs));
  }

  getCaseStatus(id: string): Observable<CaseStatusResponse> {
    const found = this.readCases().find((c) => c.item.id === id);
    if (!found) {
      throw new Error(`Case not found: ${id}`);
    }
    return of({
      id,
      status: found.detail.status,
      currentTask: found.detail.currentTask,
      lastUpdated: found.detail.lastUpdated
    }).pipe(delay(this.latencyMs));
  }

  createCase(request: CreateCaseRequest): Observable<CaseItem> {
    const procedure = this.procedures.find((p) => p.id === request.procedureId || p.slug === request.procedureId);
    const now = new Date().toISOString();
    const caseId = `EXP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const title = request.title || procedure?.name || 'Nuevo expediente';
    const description = typeof request.formData?.['applicationReason'] === 'string'
      ? String(request.formData['applicationReason'])
      : (procedure?.description ?? 'Expediente creado en modo mock.');

    const item: CaseItem = {
      id: caseId,
      procedureType: procedure?.name ?? request.procedureId,
      status: 'PENDING',
      createdAt: now,
      lastUpdated: now,
      title,
      description,
      assignedUnit: procedure?.category ?? 'Unidad General'
    };

    const detail: CaseDetail = {
      ...item,
      currentTask: 'Borrador creado',
      timeline: [
        {
          id: `${caseId}-tl-1`,
          title: 'Solicitud registrada',
          date: now,
          description: 'El expediente se ha registrado correctamente en la sede electrónica.'
        }
      ],
      attachments: [],
      procedureTypeId: request.procedureId,
      formData: request.formData
    };

    const stored = this.readCases();
    stored.push({ item, detail });
    this.writeCases(stored);

    return of(item).pipe(delay(this.latencyMs));
  }

  submitCase(id: string): Observable<CaseStatusResponse> {
    const stored = this.readCases();
    const found = stored.find((c) => c.item.id === id);
    if (!found) {
      throw new Error(`Case not found: ${id}`);
    }

    const now = new Date().toISOString();
    found.item.status = 'REVIEW';
    found.item.lastUpdated = now;
    found.detail.status = 'REVIEW';
    found.detail.lastUpdated = now;
    found.detail.currentTask = 'Revisión documental';
    found.detail.timeline.push({
      id: `${id}-tl-${found.detail.timeline.length + 1}`,
      title: 'Expediente enviado',
      date: now,
      description: 'La solicitud se ha enviado para su revisión por la unidad gestora.'
    });

    this.writeCases(stored);

    return of({
      id,
      status: 'REVIEW',
      currentTask: 'Revisión documental',
      lastUpdated: now
    }).pipe(delay(this.latencyMs));
  }

  amendCase(id: string, request: AmendCaseRequest): Observable<CaseStatusResponse> {
    const stored = this.readCases();
    const found = stored.find((c) => c.item.id === id);
    if (!found) {
      throw new Error(`Case not found: ${id}`);
    }

    const now = new Date().toISOString();
    found.item.status = 'PENDING';
    found.item.lastUpdated = now;
    found.detail.status = 'PENDING';
    found.detail.lastUpdated = now;
    found.detail.currentTask = 'Aclaración solicitada';
    found.detail.timeline.push({
      id: `${id}-tl-${found.detail.timeline.length + 1}`,
      title: 'Aclaración registrada',
      date: now,
      description: request.reason || 'Se ha registrado una solicitud de aclaración en modo mock.'
    });

    this.writeCases(stored);

    return of({
      id,
      status: 'PENDING',
      currentTask: 'Aclaración solicitada',
      lastUpdated: now
    }).pipe(delay(this.latencyMs));
  }

  private toItem(detail: ProcedureDetail): ProcedureItem {
    return {
      id: detail.id,
      slug: detail.slug,
      name: detail.name,
      description: detail.description,
      category: detail.category,
      fee: detail.fee,
      deadline: detail.deadline,
      status: detail.status
    };
  }

  private readCases(): StoredMockCase[] {
    const raw = localStorage.getItem(this.casesKey);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as StoredMockCase[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeCases(cases: StoredMockCase[]): void {
    localStorage.setItem(this.casesKey, JSON.stringify(cases));
  }
}