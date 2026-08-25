import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { ensureDir, scheduleCleanup } from '../utils/fileCleanup';
import { generateOutputPath, deriveOutputFilename } from '../utils/filenameGenerator';
import { sendError } from '../utils/responseHelpers';
import { HTTP, ERROR_CODE } from '../constants';
import {
  convertSchema,
  compressSchema,
  resizeSchema,
  rotateSchema,
  flipSchema,
  cropSchema,
} from '../validators/image.validator';
import {
  convertImage,
  compressImage,
  resizeImage,
  rotateImage,
  flipImage,
  cropImage,
  getFileSize,
} from '../services/image.service';
import type { ImageOutputFormat, FlipDirection } from '../types';

ensureDir(env.tempGeneratedDir);

function requireFile(req: Request, res: Response): Express.Multer.File | null {
  const file = req.file;
  if (!file) {
    sendError(res, 'No file was uploaded.', ERROR_CODE.MISSING_FILE, HTTP.BAD_REQUEST);
    return null;
  }
  return file;
}

/* ─────────────── Convert ─────────────── */
export async function convert(req: Request, res: Response, next: NextFunction): Promise<void> {
  const file = requireFile(req, res);
  if (!file) return;

  const parsed = convertSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Invalid parameters', ERROR_CODE.INVALID_PARAMS, HTTP.BAD_REQUEST, parsed.error.flatten());
    return;
  }

  const { outputFormat, quality } = parsed.data;
  const outputPath = generateOutputPath(env.tempGeneratedDir, outputFormat, 'converted');
  const downloadName = deriveOutputFilename(file.originalname, outputFormat);

  try {
    await convertImage({ inputPath: file.path, outputPath, outputFormat: outputFormat as ImageOutputFormat, quality });
    res.download(outputPath, downloadName, (err) => {
      scheduleCleanup([file.path, outputPath]);
      if (err && !res.headersSent) next(err);
    });
  } catch (err) {
    scheduleCleanup([file.path, outputPath]);
    next(err);
  }
}

/* ─────────────── Compress ─────────────── */
export async function compress(req: Request, res: Response, next: NextFunction): Promise<void> {
  const file = requireFile(req, res);
  if (!file) return;

  const parsed = compressSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Invalid parameters', ERROR_CODE.INVALID_PARAMS, HTTP.BAD_REQUEST, parsed.error.flatten());
    return;
  }

  const { quality, removeMetadata } = parsed.data;
  const outputPath = generateOutputPath(env.tempGeneratedDir, file.mimetype, 'compressed');
  const downloadName = deriveOutputFilename(file.originalname, file.mimetype);

  try {
    await compressImage({ inputPath: file.path, outputPath, quality, removeMetadata });
    const outSize = getFileSize(outputPath);
    const servePath = outSize < file.size ? outputPath : file.path;
    res.download(servePath, downloadName, (err) => {
      scheduleCleanup([file.path, outputPath]);
      if (err && !res.headersSent) next(err);
    });
  } catch (err) {
    scheduleCleanup([file.path, outputPath]);
    next(err);
  }
}

/* ─────────────── Resize ─────────────── */
export async function resize(req: Request, res: Response, next: NextFunction): Promise<void> {
  const file = requireFile(req, res);
  if (!file) return;

  const parsed = resizeSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Invalid parameters', ERROR_CODE.INVALID_PARAMS, HTTP.BAD_REQUEST, parsed.error.flatten());
    return;
  }

  const { width, height, maintainAspect } = parsed.data;
  const outputPath = generateOutputPath(env.tempGeneratedDir, file.mimetype, 'resized');
  const downloadName = deriveOutputFilename(file.originalname, file.mimetype);

  try {
    await resizeImage({ inputPath: file.path, outputPath, width, height, maintainAspect });
    res.download(outputPath, downloadName, (err) => {
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
  const file = requireFile(req, res);
  if (!file) return;

  const parsed = rotateSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Invalid parameters', ERROR_CODE.INVALID_PARAMS, HTTP.BAD_REQUEST, parsed.error.flatten());
    return;
  }

  const { angle: angleStr, customAngle } = parsed.data;
  const angle = angleStr === 'custom' ? customAngle : parseInt(angleStr, 10);
  const outputPath = generateOutputPath(env.tempGeneratedDir, file.mimetype, 'rotated');
  const downloadName = deriveOutputFilename(file.originalname, file.mimetype);

  try {
    await rotateImage({ inputPath: file.path, outputPath, angle });
    res.download(outputPath, downloadName, (err) => {
      scheduleCleanup([file.path, outputPath]);
      if (err && !res.headersSent) next(err);
    });
  } catch (err) {
    scheduleCleanup([file.path, outputPath]);
    next(err);
  }
}

/* ─────────────── Flip ─────────────── */
export async function flip(req: Request, res: Response, next: NextFunction): Promise<void> {
  const file = requireFile(req, res);
  if (!file) return;

  const parsed = flipSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Invalid parameters', ERROR_CODE.INVALID_PARAMS, HTTP.BAD_REQUEST, parsed.error.flatten());
    return;
  }

  const { direction } = parsed.data;
  const outputPath = generateOutputPath(env.tempGeneratedDir, file.mimetype, 'flipped');
  const downloadName = deriveOutputFilename(file.originalname, file.mimetype);

  try {
    await flipImage({ inputPath: file.path, outputPath, direction: direction as FlipDirection });
    res.download(outputPath, downloadName, (err) => {
      scheduleCleanup([file.path, outputPath]);
      if (err && !res.headersSent) next(err);
    });
  } catch (err) {
    scheduleCleanup([file.path, outputPath]);
    next(err);
  }
}

/* ─────────────── Crop ─────────────── */
export async function crop(req: Request, res: Response, next: NextFunction): Promise<void> {
  const file = requireFile(req, res);
  if (!file) return;

  const parsed = cropSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Invalid parameters', ERROR_CODE.INVALID_PARAMS, HTTP.BAD_REQUEST, parsed.error.flatten());
    return;
  }

  const { cropX, cropY, cropWidth, cropHeight } = parsed.data;
  const outputPath = generateOutputPath(env.tempGeneratedDir, file.mimetype, 'cropped');
  const downloadName = deriveOutputFilename(file.originalname, file.mimetype);

  try {
    await cropImage({ inputPath: file.path, outputPath, cropX, cropY, cropWidth, cropHeight });
    res.download(outputPath, downloadName, (err) => {
      scheduleCleanup([file.path, outputPath]);
      if (err && !res.headersSent) next(err);
    });
  } catch (err) {
    scheduleCleanup([file.path, outputPath]);
    next(err);
  }
}
