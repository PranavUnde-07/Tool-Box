import axios from 'axios';

/**
 * Shared axios instance for the TOOLBOX API.
 * In development Vite proxies /api to the local backend (see vite.config.ts);
 * in production the API is expected on the same origin.
 */
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 0,
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});

/** Shape returned by the backend's JSON error envelope. */
export interface ApiErrorBody {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

/** Human-friendly message extraction from any thrown request error. */
export async function extractApiError(err: unknown): Promise<string> {
  if (!axios.isAxiosError(err)) {
    return err instanceof Error ? err.message : 'Something went wrong. Please try again.';
  }

  if (err.code === 'ECONNABORTED' || !err.response) {
    return 'Cannot reach the local processing server. Make sure it is running (npm run dev).';
  }

  const { response } = err;
  const raw = response.data;

  // responseType: 'blob' wraps JSON error bodies — unwrap them
  if (raw instanceof Blob) {
    try {
      const text = await raw.text();
      const parsed = JSON.parse(text) as ApiErrorBody;
      if (parsed.message) return parsed.message;
    } catch {
      /* fall through */
    }
  } else if (raw && typeof raw === 'object' && 'message' in raw) {
    const parsed = raw as ApiErrorBody;
    if (parsed.message) return parsed.message;
  }

  switch (response.status) {
    case 413:
      return 'File exceeds the maximum allowed size.';
    case 429:
      return 'Too many requests — please wait a moment and try again.';
    case 503:
      return 'This tool is temporarily unavailable.';
    default:
      return `Processing failed (server error ${response.status}).`;
  }
}
