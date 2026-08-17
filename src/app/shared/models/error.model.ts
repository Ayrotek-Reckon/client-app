export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
  timestamp: string;
  path?: string;
}

export interface ValidationError extends AppError {
  fields: {
    [fieldName: string]: string[];
  };
}

export interface ErrorState {
  error: AppError | null;
  message: string | null;
  isVisible: boolean;
  type: 'error' | 'warning' | 'info' | 'success';
}

export interface HttpErrorResponseData {
  status: number;
  statusText: string;
  url: string | null;
  headers?: any;
  error?: any;
  message?: string;
}
