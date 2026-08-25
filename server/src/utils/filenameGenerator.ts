import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { MIME_TO_EXT } from '../constants';

/**
 * Generate a safe, unique filename for an upload or output.
 * Format: toolbox-<uuid>.<ext>
 */
export function generateFilename(mimeType: string, prefix = 'toolbox'): string {
  const ext = MIME_TO_EXT[mimeType] ?? 'bin';
  return `${prefix}-${uuidv4()}.${ext}`;
}

/**
 * Generate a unique filename with an explicit extension.
 */
export function generateFilenameWithExt(ext: string, prefix = 'toolbox'): string {
  const cleanExt = ext.replace(/^\./, '');
  return `${prefix}-${uuidv4()}.${cleanExt}`;
}

/**
 * Generate a full output path inside a given directory.
 */
export function generateOutputPath(dir: string, mimeType: string, prefix = 'out'): string {
  return path.join(dir, generateFilename(mimeType, prefix));
}

/**
 * Derive a safe output filename from an original filename, changing its extension.
 * Strips any path components and sanitises the name.
 */
export function deriveOutputFilename(originalName: string, newMime: string): string {
  const ext = MIME_TO_EXT[newMime] ?? 'bin';
  const base = path
    .basename(originalName, path.extname(originalName))
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 64);
  return `${base}.${ext}`;
}

/**
 * Sanitise an uploaded filename — prevent path traversal.
 */
export function sanitiseFilename(filename: string): string {
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
}
