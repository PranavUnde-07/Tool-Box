import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/responseHelpers';
import { HTTP, ERROR_CODE } from '../constants';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    sendError(
      res,
      'Validation failed',
      ERROR_CODE.INVALID_PARAMS,
      HTTP.BAD_REQUEST,
      err.flatten().fieldErrors,
    );
    return;
  }

  // Multer errors (file size, type)
  if (err.name === 'MulterError') {
    if (err.message.includes('File too large')) {
      sendError(res, 'File exceeds the maximum allowed size.', ERROR_CODE.FILE_TOO_LARGE, HTTP.TOO_LARGE);
      return;
    }
    sendError(res, err.message, ERROR_CODE.INVALID_MIME, HTTP.BAD_REQUEST);
    return;
  }

  // Unsupported file format (thrown from multer fileFilter)
  if (err.message?.toLowerCase().includes('unsupported')) {
    sendError(res, err.message, ERROR_CODE.INVALID_MIME, HTTP.BAD_REQUEST);
    return;
  }

  // Ghostscript not found
  if (err.message?.includes('GHOSTSCRIPT_NOT_FOUND') || err.code === ERROR_CODE.GS_NOT_FOUND) {
    sendError(
      res,
      'Ghostscript is not installed or not found in PATH. Please install Ghostscript to use PDF compression.',
      ERROR_CODE.GS_NOT_FOUND,
      HTTP.SERVICE_UNAVAILABLE,
    );
    return;
  }

  // Generic application errors with explicit status codes
  if (err.statusCode) {
    sendError(
      res,
      err.message || 'An error occurred',
      err.code ?? ERROR_CODE.INTERNAL,
      err.statusCode,
    );
    return;
  }

  // Fallback — unexpected errors
  console.error('[ERROR]', err);
  sendError(res, 'An unexpected error occurred', ERROR_CODE.INTERNAL, HTTP.INTERNAL);
}

export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, 'Route not found', ERROR_CODE.NOT_FOUND, HTTP.NOT_FOUND);
}
