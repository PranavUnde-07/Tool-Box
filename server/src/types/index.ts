import type { Request } from 'express';

/* ─────────────── Multer ─────────────── */
export interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

/* ─────────────── Image ─────────────── */
export type ImageOutputFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/avif';

export type FlipDirection = 'horizontal' | 'vertical' | 'both';

export interface ImageConvertParams {
  inputPath: string;
  outputPath: string;
  outputFormat: ImageOutputFormat;
  quality: number;
}

export interface ImageCompressParams {
  inputPath: string;
  outputPath: string;
  quality: number;
  removeMetadata: boolean;
}

export interface ImageResizeParams {
  inputPath: string;
  outputPath: string;
  width: number;
  height: number;
  maintainAspect: boolean;
}

export interface ImageRotateParams {
  inputPath: string;
  outputPath: string;
  angle: number;
}

export interface ImageFlipParams {
  inputPath: string;
  outputPath: string;
  direction: FlipDirection;
}

export interface ImageCropParams {
  inputPath: string;
  outputPath: string;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
}

/* ─────────────── PDF ─────────────── */
export type PdfCompressionLevel = 'screen' | 'ebook' | 'printer';
export type PdfPageSize = 'a4' | 'letter' | 'fit';
export type PdfOrientation = 'portrait' | 'landscape';

export interface PdfMergeParams {
  inputPaths: string[];
  outputPath: string;
}

export interface PdfSplitParams {
  inputPath: string;
  outputDir: string;
  pageRange: string;
}

export interface PdfCompressParams {
  inputPath: string;
  outputPath: string;
  level: PdfCompressionLevel;
}

export interface PdfRotateParams {
  inputPath: string;
  outputPath: string;
  angle: 90 | 180 | 270;
  pages: string;
}

export interface ImagesToPdfParams {
  inputPaths: string[];
  outputPath: string;
  pageSize: PdfPageSize;
  orientation: PdfOrientation;
}

export interface PdfToImagesParams {
  inputPath: string;
  outputDir: string;
  outputFormat: string;
  quality: number;
}

/* ─────────────── QR ─────────────── */
export type QrOutputFormat = 'png' | 'svg';

export interface QrGenerateParams {
  text: string;
  size: number;
  fgColor: string;
  bgColor: string;
  format: QrOutputFormat;
  outputPath: string;
}

/* ─────────────── API Response ─────────────── */
export interface ApiSuccessResponse<T = null> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

/* ─────────────── File Info ─────────────── */
export interface FileInfo {
  originalName: string;
  originalSize: number;
  outputName: string;
  outputSize: number;
  savingsPercent: number;
}
