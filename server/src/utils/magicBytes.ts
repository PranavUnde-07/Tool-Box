import fs from 'fs';

/**
 * Binary signature (magic number) definitions used to verify that uploaded
 * files actually contain the content their MIME type claims.
 * Client-declared Content-Type headers are trivially spoofable.
 */
interface Signature {
  mime: string;
  bytes: number[];
  offset: number;
}

const SIGNATURES: Signature[] = [
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0 },
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff], offset: 0 },
  { mime: 'image/bmp', bytes: [0x42, 0x4d], offset: 0 },
  { mime: 'image/tiff', bytes: [0x49, 0x49, 0x2a, 0x00], offset: 0 },
  { mime: 'image/tiff', bytes: [0x4d, 0x4d, 0x00, 0x2a], offset: 0 },
  // WEBP: RIFF....WEBP
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 },
  { mime: 'image/webp', bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 },
  // AVIF/HEIF family: ....ftyp<brand>
  { mime: 'image/avif', bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 },
  // PDF: %PDF-
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 },
];

/** Read the leading bytes of a file and return every matching signature MIME. */
function detectMimes(filePath: string): string[] {
  try {
    return readSyncMimes(filePath);
  } catch {
    return [];
  }
}

function readSyncMimes(filePath: string): string[] {
  const header = Buffer.alloc(16);
  const fd = fs.openSync(filePath, 'r');
  try {
    const read = fs.readSync(fd, header, 0, 16, 0);
    const buf = header.subarray(0, read);
    return SIGNATURES.filter((sig) => {
      if (buf.length < sig.offset + sig.bytes.length) return false;
      return sig.bytes.every((b, i) => buf[sig.offset + i] === b);
    }).map((sig) => sig.mime);
  } finally {
    fs.closeSync(fd);
  }
}

/**
 * Verify that a file's binary content matches one of the allowed MIME types.
 * SVG is text-based and checked separately by sniffing for markup.
 *
 * @param filePath Path to the uploaded file on disk
 * @param allowed List of acceptable MIME types (declared types)
 * @returns true when content plausibly matches an allowed type
 */
export function fileContentMatches(filePath: string, allowed: readonly string[]): boolean {
  const detected = detectMimes(filePath);

  // WEBP requires both RIFF and WEBP markers; AVIF requires ftyp with avif brand
  if (detected.includes('image/webp')) {
    const webpOk = detected.filter((m) => m === 'image/webp').length === 2 && allowed.includes('image/webp');
    if (!webpOk) return false;
    return true;
  }

  if (detected.includes('image/avif')) {
    if (!allowed.includes('image/avif')) return false;
    // Confirm brand is exactly "avif" or "avis"
    try {
      const fd = fs.openSync(filePath, 'r');
      try {
        const brand = Buffer.alloc(4);
        fs.readSync(fd, brand, 0, 4, 8);
        const b = brand.toString('ascii');
        return b === 'avif' || b === 'avis';
      } finally {
        fs.closeSync(fd);
      }
    } catch {
      return false;
    }
  }

  const binaryMatch = detected.some((m) => m !== 'image/webp' && m !== 'image/avif' && allowed.includes(m));
  if (binaryMatch) return true;

  // SVG fallback — text markup, not covered by binary signatures
  if (allowed.includes('image/svg+xml')) return looksLikeSvg(filePath);

  return false;
}

/** Heuristic SVG detection: BOM-tolerant scan of the first KB for <svg or <?xml. */
function looksLikeSvg(filePath: string): boolean {
  try {
    const fd = fs.openSync(filePath, 'r');
    try {
      const buf = Buffer.alloc(1024);
      const read = fs.readSync(fd, buf, 0, 1024, 0);
      const head = buf.subarray(0, read).toString('utf8').replace(/^\uFEFF/, '').trimStart();
      return head.startsWith('<svg') || head.startsWith('<?xml');
    } finally {
      fs.closeSync(fd);
    }
  } catch {
    return false;
  }
}
