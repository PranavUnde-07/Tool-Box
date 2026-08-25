import { z } from 'zod';

const compressionLevels = ['screen', 'ebook', 'printer'] as const;
const pageSizes = ['a4', 'letter', 'fit'] as const;
const orientations = ['portrait', 'landscape'] as const;
const imageOutputFormats = ['image/png', 'image/jpeg', 'image/webp'] as const;

export const mergeSchema = z.object({});

export const splitSchema = z.object({
  pageRange: z
    .string()
    .min(1, 'pageRange is required')
    .max(200)
    .regex(
      /^(all|(\d+(-\d+)?)(,\s*(\d+(-\d+)?))*)$/,
      'pageRange must be "all" or a comma-separated list of pages/ranges like "1-3,5,8-10"',
    ),
});

export const compressSchema = z.object({
  compressionLevel: z.enum(compressionLevels).optional().default('ebook'),
});

export const rotateSchema = z.object({
  angle: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.union([z.literal(90), z.literal(180), z.literal(270)])),
  pages: z.string().optional().default('all'),
});

export const imagesToPdfSchema = z.object({
  pageSize: z.enum(pageSizes).optional().default('a4'),
  orientation: z.enum(orientations).optional().default('portrait'),
});

export const pdfToImagesSchema = z.object({
  outputFormat: z.enum(imageOutputFormats).optional().default('image/png'),
  quality: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 90))
    .pipe(z.number().min(10).max(100)),
});
