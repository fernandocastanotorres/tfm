import { Injectable } from '@angular/core';

export type ProcedureTaskType = 'form' | 'upload' | 'review';

export type ProcedureFieldType = 'text' | 'textarea' | 'email' | 'select' | 'number' | 'phone';

export interface ProcedureFieldOption {
  value: string;
  labelKey: string;
}

export interface ProcedureFormField {
  id: string;
  labelKey: string;
  placeholderKey: string;
  required: boolean;
  type: ProcedureFieldType;
  options?: ProcedureFieldOption[];
}

export interface ProcedureUploadRequirement {
  id: string;
  labelKey: string;
  required: boolean;
}

export interface ProcedureTask {
  id: string;
  type: ProcedureTaskType;
  titleKey: string;
  descriptionKey: string;
  fields?: ProcedureFormField[];
  uploadRequirements?: ProcedureUploadRequirement[];
}

export interface ProcedureItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  feeAmount: number;
  deadlineDays: number;
  statusKey: string;
  unitKey: string;
  tasks: ProcedureTask[];
}

@Injectable({
  providedIn: 'root'
})
export class ProceduresService {
  private readonly procedures: Omit<ProcedureItem, 'tasks'>[] = [
    {
      id: 'procedure-license',
      titleKey: 'PROCEDURES.LICENSE_TITLE',
      descriptionKey: 'PROCEDURES.LICENSE_DESC',
      feeAmount: 120,
      deadlineDays: 30,
      statusKey: 'PROCEDURES.STATUS_AVAILABLE',
      unitKey: 'PROCEDURES.UNIT_URBANISM',
    },
    {
      id: 'procedure-registry',
      titleKey: 'PROCEDURES.REGISTRY_TITLE',
      descriptionKey: 'PROCEDURES.REGISTRY_DESC',
      feeAmount: 0,
      deadlineDays: 15,
      statusKey: 'PROCEDURES.STATUS_IN_REVIEW',
      unitKey: 'PROCEDURES.UNIT_REGISTRY',
    },
    {
      id: 'procedure-updates',
      titleKey: 'PROCEDURES.UPDATE_TITLE',
      descriptionKey: 'PROCEDURES.UPDATE_DESC',
      feeAmount: 45,
      deadlineDays: 20,
      statusKey: 'PROCEDURES.STATUS_AVAILABLE',
      unitKey: 'PROCEDURES.UNIT_GENERAL',
    }
  ];

  private readonly tasksByProcedure = new Map<string, ProcedureTask[]>();

  getProcedures(): ProcedureItem[] {
    return this.procedures.map((procedure) => ({
      ...procedure,
      tasks: this.getTasks(procedure.id)
    }));
  }

  getProcedureById(id: string): ProcedureItem | undefined {
    const procedure = this.procedures.find((item) => item.id === id);
    if (!procedure) {
      return undefined;
    }

    return {
      ...procedure,
      tasks: this.getTasks(procedure.id)
    };
  }

  private getTasks(procedureId: string): ProcedureTask[] {
    const existing = this.tasksByProcedure.get(procedureId);
    if (existing) {
      return existing;
    }

    const tasks = this.buildTasks(procedureId);
    this.tasksByProcedure.set(procedureId, tasks);
    return tasks;
  }

  private buildTasks(seedId: string): ProcedureTask[] {
    const types: ProcedureTaskType[] = ['form', 'upload', 'review'];
    const shuffled = this.shuffle([...types]);

    return shuffled.map((type, index) => ({
      id: `${seedId}-task-${index + 1}`,
      type,
      titleKey: `PROCEDURE_FLOW.TASK_${type.toUpperCase()}_TITLE`,
      descriptionKey: `PROCEDURE_FLOW.TASK_${type.toUpperCase()}_DESC`,
      fields: type === 'form' ? this.getFormFields() : undefined,
      uploadRequirements: type === 'upload' ? this.getUploadRequirements() : undefined
    }));
  }

  private getFormFields(): ProcedureFormField[] {
    return [
      {
        id: 'subject',
        labelKey: 'CASE_WIZARD.FIELD_SUBJECT',
        placeholderKey: 'CASE_WIZARD.FIELD_SUBJECT_PLACEHOLDER',
        required: true,
        type: 'text'
      },
      {
        id: 'description',
        labelKey: 'CASE_WIZARD.FIELD_DESCRIPTION',
        placeholderKey: 'CASE_WIZARD.FIELD_DESCRIPTION_PLACEHOLDER',
        required: true,
        type: 'textarea'
      },
      {
        id: 'referenceNumber',
        labelKey: 'CASE_WIZARD.FIELD_REFERENCE_NUMBER',
        placeholderKey: 'CASE_WIZARD.FIELD_REFERENCE_NUMBER_PLACEHOLDER',
        required: false,
        type: 'number'
      },
      {
        id: 'contactPhone',
        labelKey: 'CASE_WIZARD.FIELD_CONTACT_PHONE',
        placeholderKey: 'CASE_WIZARD.FIELD_CONTACT_PHONE_PLACEHOLDER',
        required: false,
        type: 'phone'
      },
      {
        id: 'contactEmail',
        labelKey: 'CASE_WIZARD.FIELD_CONTACT_EMAIL',
        placeholderKey: 'CASE_WIZARD.FIELD_CONTACT_EMAIL_PLACEHOLDER',
        required: false,
        type: 'email'
      },
      {
        id: 'contactChannel',
        labelKey: 'CASE_WIZARD.FIELD_CONTACT_CHANNEL',
        placeholderKey: 'CASE_WIZARD.FIELD_CONTACT_CHANNEL_PLACEHOLDER',
        required: false,
        type: 'select',
        options: [
          { value: 'email', labelKey: 'CASE_WIZARD.FIELD_CONTACT_CHANNEL_EMAIL' },
          { value: 'phone', labelKey: 'CASE_WIZARD.FIELD_CONTACT_CHANNEL_PHONE' }
        ]
      }
    ];
  }

  private getUploadRequirements(): ProcedureUploadRequirement[] {
    return [
      {
        id: 'identity',
        labelKey: 'CASE_WIZARD.UPLOAD_ID',
        required: true
      },
      {
        id: 'supporting',
        labelKey: 'CASE_WIZARD.UPLOAD_SUPPORTING',
        required: false
      }
    ];
  }

  private shuffle<T>(values: T[]): T[] {
    for (let i = values.length - 1; i > 0; i -= 1) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [values[i], values[randomIndex]] = [values[randomIndex], values[i]];
    }
    return values;
  }
}
