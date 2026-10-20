// Envelope every endpoint returns: { success, data, message? }.
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Paginated list payload, e.g. Paged<'subjects', Subject> = { subjects: Subject[]; total; page; limit }.
export type Paged<K extends string, T> = { [P in K]: T[] } & { total: number; page: number; limit: number };
