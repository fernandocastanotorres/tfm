/**
 * API response models for procedure catalog.
 * Backend: Spring Boot 3.2.5 at /api/v1/procedures/*
 */

export interface ProcedureItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  fee: number;
  deadline: number;
  status: string;
}

export interface ProcedureDetail extends ProcedureItem {
  tasks: ProcedureTaskDto[];
}

export interface ProcedureTaskDto {
  id: string;
  name: string;
  type: string;
  description: string;
  formFields?: FormFieldDto[];
  uploadRequirements?: UploadRequirementDto[];
}

export interface FormFieldDto {
  id: string;
  name: string;
  type: string;
  required: boolean;
  placeholder: string;
  options?: FieldOptionDto[];
}

export interface FieldOptionDto {
  value: string;
  label: string;
}

export interface UploadRequirementDto {
  id: string;
  name: string;
  required: boolean;
}
