import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { env } from '../config/env';
import { ensureDir, scheduleCleanup } from '../utils/fileCleanup';
import { generateFilenameWithExt } from '../utils/filenameGenerator';
import { sendError } from '../utils/responseHelpers';
import { HTTP, ERROR_CODE } from '../constants';
import {
  mergeSchema,
  splitSchema,
  compressSchema,
  rotateSchema,
  imagesToPdfSchema,
  pdfToImagesSchema,
} from '../validators/pdf.validator';
import {
  mergePdfs,
  splitPdf,
  compressPdf,
  rotatePdf,
  imagesToPdf,
  pdfToImages,
  createZip,
  getFileSize,
} from '../services/pdf.service';
import type { PdfCompressionLevel, PdfOrientation, PdfPageSize } from '../types';

ensureDir(env.tempGeneratedDir);

function getMultipleFiles(req: Request, res: Response): Express.Multer.File[] | null {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    sendError(res, 'No files were uploaded.', ERROR_CODE.MISSING_FILE, HTTP.BAD_REQUEST);
    return null;
  }
  return files;
}

function getSingleFile(req: Request, res: Response): Express.Multer.File | null {
  const file = req.file;
  if (!file) {
    sendError(res, 'No file was uploaded.', ERROR_CODE.MISSING_FILE, HTTP.BAD_REQUEST);
    return null;
  }
  return file;
}

/* ─────────────── Merge ─────────────── */
export async function merge(req: Request, res: Response, next: NextFunction): Promise<void> {
  const files = getMultipleFiles(req, res);
  if (!files) return;

  if (files.length < 2) {
    sendError(res, 'At least 2 PDF files are required to merge.', ERROR_CODE.INVALID_PARAMS, HTTP.BAD_REQUEST);
    return;
  }

  const parsed = mergeSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Invalid parameters', ERROR_CODE.INVALID_PARAMS, HTTP.BAD_REQUEST, parsed.error.flatten());
    return;
  }

  const outputPath = path.join(env.tempGeneratedDir, generateFilenameWithExt('pdf', 'merged'));
  const inputPaths = files.map((f) => f.path);

  try {
    await mergePdfs({ inputPaths, outputPath });
    res.download(outputPath, 'merged.pdf', (err) => {
      scheduleCleanup([...inputPaths, outputPath]);
      if (err && !res.headersSent) next(err);
    });
  } catch (err) {
    scheduleCleanup([...inputPaths, outputPath]);
    next(err);
  }
}

/* ─────────────── Split ─────────────── */
export async function split(req: Request, res: Response, next: NextFunction): Promise<void> {
  const file = getSingleFile(req, res);
  if (!file) return;

  const parsed = splitSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Invalid parameters', ERROR_CODE.INVALID_PARAMS, HTTP.BAD_REQUEST, parsed.error.flatten());
    return;
  }

  const { pageRange } = parsed.data;
  const outputDir = path.join(env.tempGeneratedDir, `split-${Date.now()}`);
  const zipPath = path.join(env.tempGeneratedDir, generateFilenameWithExt('zip', 'split'));

  try {
    const splitFiles = await splitPdf({ inputPath: file.path, outputDir, pageRange });

    if (splitFiles.length === 0) {
      sendError(res, 'No pages matched the specified range.', ERROR_CODE.INVALID_PARAMS, HTTP.BAD_REQUEST);
      scheduleCleanup([file.path]);
      return;
    }

    if (splitFiles.length === 1 && splitFiles[0]) {
      // Single result — send directly
      res.download(splitFiles[0], 'split.pdf', (err) => {
        scheduleCleanup([file.path, ...splitFiles, zipPath]);
        if (err && !res.headersSent) next(err);
      });
    } else {
      await createZip(splitFiles, zipPath);
      res.download(zipPath, 'split-pages.zip', (err) => {
        scheduleCleanup([file.path, ...splitFiles, zipPath]);
        if (err && !res.headersSent) next(err);
      });
    }
  } catch (err) {
    scheduleCleanup([file.path, zipPath]);
    next(err);
  }
}

/* ─────────────── Compress ─────────────── */
export async function compress(req: Request, res: Response, next: NextFunction): Promise<void> {
  const file = getSingleFile(req, res);
  if (!file) return;

  const parsed = compressSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Invalid parameters', ERROR_CODE.INVALID_PARAMS, HTTP.BAD_REQUEST, parsed.error.flatten());
    return;
  }

  const { compressionLevel } = parsed.data;
  const outputPath = path.join(env.tempGeneratedDir, generateFilenameWithExt('pdf', 'compressed'));
  const downloadName = file.originalname.replace('.pdf', '-compressed.pdf');

  try {
    await compressPdf({ inputPath: file.path, outputPath, level: compressionLevel as PdfCompressionLevel });

    // Only send compressed version if it's actually smaller
    const outSize = getFileSize(outputPath);
    const inSize = file.size;
    const servePath = outSize < inSize ? outputPath : file.path;

    res.download(servePath, downloadName, (err) => {
      scheduleCleanup([file.path, outputPath]);
      if (err && !res.headersSent) next(err);
    });
  } catch (err) {
    scheduleCleanup([file.path, outputPath]);
    next(err);
  }
}

/* ─────────────── Rotate ─────────────── */
export async function rotate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const file = getSingleFile(req, res);
  if (!file) return;

  const parsed = rotateSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Invalid parameters', ERROR_CODE.INVALID_PARAMS, HTTP.BAD_REQUEST, parsed.error.flatten());
    return;
  }

  const { angle, pages } = parsed.data;
  const outputPath = path.join(env.tempGeneratedDir, generateFilenameWithExt('pdf', 'rotated'));
  const downloadName = file.originalname.replace('.pdf', '-rotated.pdf');

  try {
    await rotatePdf({ inputPath: file.path, outputPath, angle: angle as 90 | 180 | 270, pages });
    res.download(outputPath, downloadName, (err) => {
      scheduleCleanup([file.path, outputPath]);
      if (err && !res.headersSent) next(err);
    });
  } catch (err) {
    scheduleCleanup([file.path, outputPath]);
    next(err);
  }
}

/* ─────────────── Images to PDF ─────────────── */
export async function imagesToPdfHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const files = getMultipleFiles(req, res);
  if (!files) return;

  const parsed = imagesToPdfSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Invalid parameters', ERROR_CODE.INVALID_PARAMS, HTTP.BAD_REQUEST, parsed.error.flatten());
    return;
  }

  const { pageSize, orientation } = parsed.data;
  const outputPath = path.join(env.tempGeneratedDir, generateFilenameWithExt('pdf', 'images-to-pdf'));
  const inputPaths = files.map((f) => f.path);

  try {
    await imagesToPdf({ inputPaths, outputPath, pageSize: pageSize as PdfPageSize, orientation: orientation as PdfOrientation });
    res.download(outputPath, 'images-to-pdf.pdf', (err) => {
      scheduleCleanup([...inputPaths, outputPath]);
      if (err && !res.headersSent) next(err);
    });
  } catch (err) {
    scheduleCleanup([...inputPaths, outputPath]);
    next(err);
  }
}

/* ─────────────── PDF to Images ─────────────── */
export async function pdfToImagesHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const file = getSingleFile(req, res);
  if (!file) return;

  const parsed = pdfToImagesSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Invalid parameters', ERROR_CODE.INVALID_PARAMS, HTTP.BAD_REQUEST, parsed.error.flatten());
    return;
  }

  const { outputFormat, quality } = parsed.data;
  const outputDir = path.join(env.tempGeneratedDir, `pdf-images-${Date.now()}`);
  const zipPath = path.join(env.tempGeneratedDir, generateFilenameWithExt('zip', 'pdf-images'));

  try {
    const imagePaths = await pdfToImages({ inputPath: file.path, outputDir, outputFormat, quality });

    if (imagePaths.length === 1 && imagePaths[0]) {
      const ext = outputFormat === 'image/jpeg' ? 'jpg' : outputFormat === 'image/webp' ? 'webp' : 'png';
      res.download(imagePaths[0], `page-1.${ext}`, (err) => {
        scheduleCleanup([file.path, ...imagePaths, zipPath]);
        if (err && !res.headersSent) next(err);
      });
    } else {
      await createZip(imagePaths, zipPath);
      res.download(zipPath, 'pdf-images.zip', (err) => {
        scheduleCleanup([file.path, ...imagePaths, zipPath]);
        if (err && !res.headersSent) next(err);
      });
    }
  } catch (err) {
    scheduleCleanup([file.path, zipPath]);
    next(err);
  }
}

// end of controller
