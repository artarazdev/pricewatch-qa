export interface ValidationError {
  type: 'ValidationError';
  field: string;
  message: string;
}

export interface ExtractionError {
  type: 'ExtractionError';
  field: string;
  reason: string;
}
