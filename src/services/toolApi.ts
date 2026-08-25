import { apiClient } from './apiClient';

/**
 * Registry mapping every active file tool to its backend endpoint.
 * Keys must match tool IDs in src/config/tools.ts.
 * The backend routes live under server/src/routes/*.
 */
export const ENDPOINTS: Record<string, string> = {
  // Image tools
  'image-converter': '/image/convert',
  'image-compressor': '/image/compress',
  'image-resizer': '/image/resize',
  'crop-image': '/image/crop',
  'rotate-image': '/image/rotate',
  'flip-image': '/image/flip',
  'convert-to-png': '/image/to-png',
  'convert-to-jpg': '/image/to-jpg',
  'convert-to-webp': '/image/to-webp',
  'convert-to-avif': '/image/to-avif',

  // PDF tools
  'merge-pdf': '/pdf/merge',
  'split-pdf': '/pdf/split',
  'compress-pdf': '/pdf/compress',
  'rotate-pdf': '/pdf/rotate',
  'images-to-pdf': '/pdf/images-to-pdf',
  'pdf-to-images': '/pdf/pdf-to-images',
};

export interface ProcessRequest {
  toolId: string;
  files: File[];
  settings: Record<string, string | number | boolean>;
  onUploadProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export interface ProcessResponse {
  blob: Blob;
  fileName: string;
}

/** Pull the filename out of a Content-Disposition header. */
function parseFilename(header: string | undefined): string | null {
  if (!header) return null;

  const utf8Match = header.match(/filename\*=(?:UTF-8'')?([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/["']/g, '').trim());
    } catch {
      return utf8Match[1].replace(/["']/g, '');
    }
  }

  const plain = header.match(/filename="?([^";]+)"?/i);
  return plain?.[1]?.trim() ?? null;
}

/**
 * Send the uploaded files + settings to the local backend and return the
 * processed output as a Blob ready for download.
 */
export async function processFiles(req: ProcessRequest): Promise<ProcessResponse> {
  const endpoint = ENDPOINTS[req.toolId];
  if (!endpoint) {
    throw new Error(`No processing endpoint is configured for "${req.toolId}".`);
  }

  const form = new FormData();

  if (req.files.length === 1) {
    form.append('file', req.files[0], req.files[0].name);
  } else {
    for (const file of req.files) {
      form.append('files', file, file.name);
    }
  }

  for (const [key, value] of Object.entries(req.settings)) {
    form.append(key, String(value));
  }

  const response = await apiClient.post(endpoint, form, {
    responseType: 'blob',
    signal: req.signal,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (!req.onUploadProgress || !e.total) return;
      req.onUploadProgress(Math.round((e.loaded / e.total) * 100));
    },
  });

  const contentType = String(response.headers['content-type'] ?? '');

  // The server only ever streams files on success; a JSON body means failure
  if (contentType.includes('application/json')) {
    try {
      const text = await response.data.text();
      const parsed = JSON.parse(text) as { message?: string };
      throw new Error(parsed.message ?? 'Processing failed.');
    } catch (e) {
      if (e instanceof SyntaxError) throw new Error('Processing failed.');
      throw e;
    }
  }

  const fileName =
    parseFilename(response.headers['content-disposition']) ??
    req.files[0]?.name.replace(/\.[^.]+$/, '_output') ??
    'output';

  return { blob: response.data as Blob, fileName };
}
