import path from 'path';
import { MIME_TO_EXT, ALLOWED_IMAGE_MIMES, ALLOWED_PDF_MIMES } from '../constants';

type AllowedImageMime = (typeof ALLOWED_IMAGE_MIMES)[number];
type AllowedPdfMime = (typeof ALLOWED_PDF_MIMES)[number];

/**
 * Get file extension from a MIME type.
 */
export function mimeToExt(mime: string): string {
  return MIME_TO_EXT[mime] ?? 'bin';
}

/**
 * Derive MIME type from a file extension.
 */
export function extToMime(ext: string): string {
  const clean = ext.replace(/^\./, '').toLowerCase();
  const entry = Object.entries(MIME_TO_EXT).find(([, e]) => e === clean);
  return entry ? entry[0] : 'application/octet-stream';
}

/**
 * Check if a MIME type is an allowed image format.
 */
export function isAllowedImage(mime: string): mime is AllowedImageMime {
  return (ALLOWED_IMAGE_MIMES as readonly string[]).includes(mime);
}

/**
 * Check if a MIME type is an allowed PDF format.
 */
export function isAllowedPdf(mime: string): mime is AllowedPdfMime {
  return (ALLOWED_PDF_MIMES as readonly string[]).includes(mime);
}

/**
 * Validate that a file's extension matches its declared MIME type.
 * Prevents extension spoofing.
 */
export function extensionMatchesMime(filename: string, mime: string): boolean {
  const ext = path.extname(filename).replace(/^\./, '').toLowerCase();
  const expectedExt = MIME_TO_EXT[mime];
  if (!expectedExt) return false;
  // jpg/jpeg equivalence
  if (expectedExt === 'jpg' && ext === 'jpeg') return true;
  if (expectedExt === 'jpg' && ext === 'jpg') return true;
  return ext === expectedExt;
}
