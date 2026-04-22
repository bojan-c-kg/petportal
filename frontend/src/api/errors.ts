import axios from 'axios';

export interface FieldErrors {
  [field: string]: string[];
}

export interface NormalisedError {
  message: string;
  fieldErrors?: FieldErrors;
  status?: number;
}

export function normaliseError(error: unknown, fallback: string): NormalisedError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as
      | { detail?: string; title?: string; errors?: FieldErrors }
      | undefined;

    const fieldErrors = data?.errors;
    const message = data?.detail ?? data?.title ?? fallback;
    return { message, fieldErrors, status };
  }
  return { message: fallback };
}
