import multer from 'multer';
import path from 'path';
import { env } from '../config/env';
import { ensureDir } from '../utils/fileCleanup';
import { generateFilenameWithExt } from '../utils/filenameGenerator';
import { isAllowedImage, isAllowedPdf } from '../utils/mimeHelpers';
import { SIZE_LIMITS } from '../constants';
import type { Request } from 'express';

// Ensure upload directory exists on startup
ensureDir(env.tempUploadsDir);

/* ─────────────── Storage ─────────────── */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.tempUploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).replace(/^\./, '').toLowerCase();
    cb(null, generateFilenameWithExt(ext, 'upload'));
  },
});

/* ─────────────── Image Filter ─────────────── */
function imageFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  if (isAllowedImage(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported image format: ${file.mimetype}`));
  }
}

/* ─────────────── PDF Filter ─────────────── */
function pdfFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  if (isAllowedPdf(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file format: ${file.mimetype}. Only PDF files are accepted.`));
  }
}

/* ─────────────── Image Upload (single) ─────────────── */
export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: SIZE_LIMITS.IMAGE },
}).single('file');

/* ─────────────── Image Upload (multiple — for images-to-pdf) ─────────────── */
export const uploadImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: SIZE_LIMITS.IMAGE },
}).array('files', 50);

/* ─────────────── PDF Upload (single) ─────────────── */
export const uploadPdf = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: SIZE_LIMITS.PDF },
}).single('file');

/* ─────────────── PDF Upload (multiple — for merge) ─────────────── */
export const uploadPdfs = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: SIZE_LIMITS.PDF },
}).array('files', 20);
