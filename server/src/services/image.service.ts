import sharp from 'sharp';
import type { FormatEnum } from 'sharp';
import fs from 'fs';
import type {
  ImageConvertParams,
  ImageCompressParams,
  ImageResizeParams,
  ImageRotateParams,
  ImageFlipParams,
  ImageCropParams,
} from '../types';

type SharpFormat = keyof FormatEnum;

function toSharpFormat(format: string): SharpFormat {
  return format as SharpFormat;
}

/* ─────────────── Convert ─────────────── */
export async function convertImage(params: ImageConvertParams): Promise<void> {
  const { inputPath, outputPath, outputFormat, quality } = params;

  let pipeline = sharp(inputPath);

  switch (outputFormat) {
    case 'image/png':
      pipeline = pipeline.png({ compressionLevel: Math.round(((100 - quality) / 100) * 9) });
      break;
    case 'image/jpeg':
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      break;
    case 'image/webp':
      pipeline = pipeline.webp({ quality });
      break;
    case 'image/avif':
      pipeline = pipeline.avif({ quality });
      break;
    default:
      pipeline = pipeline.png();
  }

  await pipeline.toFile(outputPath);
}

/* ─────────────── Compress ─────────────── */
export async function compressImage(params: ImageCompressParams): Promise<void> {
  const { inputPath, outputPath, quality, removeMetadata } = params;

  const meta = await sharp(inputPath).metadata();
  const format = meta.format ?? 'jpeg';

  let pipeline = sharp(inputPath);

  if (removeMetadata) {
    pipeline = pipeline.withMetadata({});
  }

  switch (format) {
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 9, effort: 10 });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality });
      break;
    default:
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  }

  await pipeline.toFile(outputPath);
}

/* ─────────────── Resize ─────────────── */
export async function resizeImage(params: ImageResizeParams): Promise<void> {
  const { inputPath, outputPath, width, height, maintainAspect } = params;

  const meta = await sharp(inputPath).metadata();
  const format = toSharpFormat(meta.format ?? 'jpeg');

  await sharp(inputPath)
    .resize({
      width,
      height,
      fit: maintainAspect ? 'inside' : 'fill',
      withoutEnlargement: false,
    })
    .toFormat(format)
    .toFile(outputPath);
}

/* ─────────────── Rotate ─────────────── */
export async function rotateImage(params: ImageRotateParams): Promise<void> {
  const { inputPath, outputPath, angle } = params;

  const meta = await sharp(inputPath).metadata();
  const format = toSharpFormat(meta.format ?? 'jpeg');

  await sharp(inputPath)
    .rotate(angle, { background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toFormat(format)
    .toFile(outputPath);
}

/* ─────────────── Flip ─────────────── */
export async function flipImage(params: ImageFlipParams): Promise<void> {
  const { inputPath, outputPath, direction } = params;

  const meta = await sharp(inputPath).metadata();
  const format = toSharpFormat(meta.format ?? 'jpeg');

  let pipeline = sharp(inputPath);

  if (direction === 'horizontal' || direction === 'both') {
    pipeline = pipeline.flop();
  }
  if (direction === 'vertical' || direction === 'both') {
    pipeline = pipeline.flip();
  }

  await pipeline.toFormat(format).toFile(outputPath);
}

/* ─────────────── Crop ─────────────── */
export async function cropImage(params: ImageCropParams): Promise<void> {
  const { inputPath, outputPath, cropX, cropY, cropWidth, cropHeight } = params;

  const meta = await sharp(inputPath).metadata();
  const format = toSharpFormat(meta.format ?? 'jpeg');
  const imgWidth = meta.width ?? 0;
  const imgHeight = meta.height ?? 0;

  const safeLeft = Math.max(0, Math.min(cropX, imgWidth - 1));
  const safeTop = Math.max(0, Math.min(cropY, imgHeight - 1));
  const safeWidth = Math.max(1, Math.min(cropWidth, imgWidth - safeLeft));
  const safeHeight = Math.max(1, Math.min(cropHeight, imgHeight - safeTop));

  await sharp(inputPath)
    .extract({ left: safeLeft, top: safeTop, width: safeWidth, height: safeHeight })
    .toFormat(format)
    .toFile(outputPath);
}

/* ─────────────── Get file size ─────────────── */
export function getFileSize(filePath: string): number {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}
