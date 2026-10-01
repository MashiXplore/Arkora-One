// src/types/api.types.ts
// Tipos compartidos para las respuestas de la API entre Frontend y Backend

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface ApiSuccessList<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
  message: string;
}

export interface ApiSuccessOne<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessOne<T> | ApiError;
export type ApiListResponse<T> = ApiSuccessList<T> | ApiError;
