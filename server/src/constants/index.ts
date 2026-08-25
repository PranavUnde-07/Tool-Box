/* ─────────────── HTTP Status Codes ─────────────── */
export const HTTP = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  UNPROCESSABLE: 422,
  TOO_LARGE: 413,
  INTERNAL: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/* ─────────────── Error Codes ─────────────── */
export const ERROR_CODE = {
  MISSING_FILE: 'MISSING_FILE',
  INVALID_MIME: 'INVALID_MIME',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_PARAMS: 'INVALID_PARAMS',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL: 'INTERNAL_ERROR',
  GS_NOT_FOUND: 'GHOSTSCRIPT_NOT_FOUND',
} as const;

/* ─────────────── Allowed MIME Types ─────────────── */
export const ALLOWED_IMAGE_MIMES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/bmp',
  'image/tiff',
] as const;

export const ALLOWED_PDF_MIMES = ['application/pdf'] as const;

/* ─────────────── Size Limits (bytes) ─────────────── */
export const SIZE_LIMITS = {
  IMAGE: 50 * 1024 * 1024,  // 50 MB
  PDF: 100 * 1024 * 1024,   // 100 MB
} as const;

/* ─────────────── MIME → Extension Map ─────────────── */
export const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
  'application/pdf': 'pdf',
};

/* ─────────────── Temp Dir Names ─────────────── */
export const TEMP_DIRS = {
  UPLOADS: 'temp/uploads',
  GENERATED: 'temp/generated',
} as const;
