import type { Request, Response, NextFunction } from 'express';
import { fileContentMatches } from '../utils/magicBytes';
import { deleteFiles } from '../utils/fileCleanup';
import { sendError } from '../utils/responseHelpers';
import { HTTP, ERROR_CODE, ALLOWED_IMAGE_MIMES, ALLOWED_PDF_MIMES } from '../constants';

type FileKind = 'image' | 'pdf';

const ALLOWED: Record<FileKind, readonly string[]> = {
  image: ALLOWED_IMAGE_MIMES,
  pdf: ALLOWED_PDF_MIMES,
};

function collectUploaded(req: Request): Express.Multer.File[] {
  if (req.file) return [req.file];
  if (Array.isArray(req.files)) return req.files;
  return [];
}

/**
 * Post-upload content verification. Runs AFTER multer has written files to
 * disk and inspects their actual binary signatures — the client-declared
 * Content-Type is never trusted on its own.
 *
 * On mismatch every uploaded file is deleted immediately and a 400 is sent.
 */
export function validateFileContent(kind: FileKind) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const files = collectUploaded(req);

    if (files.length === 0) {
      sendError(res, 'No file was uploaded.', ERROR_CODE.MISSING_FILE, HTTP.BAD_REQUEST);
      return;
    }

    const allowed = ALLOWED[kind];
    const impostor = files.find((f) => !fileContentMatches(f.path, allowed));

    if (impostor) {
      deleteFiles(files.map((f) => f.path));
      sendError(
        res,
        `File content does not match its declared type. Only ${allowed.join(', ')} are accepted.`,
        ERROR_CODE.INVALID_MIME,
        HTTP.BAD_REQUEST,
      );
      return;
    }

    next();
  };
}
