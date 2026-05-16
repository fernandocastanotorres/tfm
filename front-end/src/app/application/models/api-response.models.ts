/**
 * Shared API error response models.
 */

export interface ErrorDetail {
  field: string;
  issue: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
  correlationId: string;
  details?: ErrorDetail[];
}
