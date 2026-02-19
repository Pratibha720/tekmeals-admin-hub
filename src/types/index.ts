export * from './auth';
export * from './order';
export * from './employee';
export * from './product';
export * from './billing';
export * from './report';

// Common types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SelectOption {
  value: string;
  label: string;
}
