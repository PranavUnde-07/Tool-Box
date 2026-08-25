import type { Response } from 'express';
import type { ApiSuccessResponse, ApiErrorResponse } from '../types';
import { HTTP } from '../constants';

/**
 * Send a consistent JSON success response.
 */
export function sendSuccess<T>(
  res: Response,
  message: string,
  data: T,
  statusCode = HTTP.OK,
): void {
  const body: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(body);
}

/**
 * Send a consistent JSON error response.
 */
export function sendError(
  res: Response,
  message: string,
  code: string,
  statusCode: number = HTTP.INTERNAL,
  details?: unknown,
): void {
  const body: ApiErrorResponse = {
    success: false,
    message,
    code,
    ...(details !== undefined ? { details } : {}),
  };
  res.status(statusCode).json(body);
}

/**
 * Compute file size savings as a percentage.
 */
export function computeSavings(originalBytes: number, outputBytes: number): number {
  if (originalBytes === 0) return 0;
  const saved = originalBytes - outputBytes;
  return Math.max(0, Math.round((saved / originalBytes) * 100));
}
