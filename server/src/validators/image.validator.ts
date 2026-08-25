import { z } from 'zod';

const imageOutputFormats = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'] as const;
const flipDirections = ['horizontal', 'vertical', 'both'] as const;
const rotateAngles = ['90', '180', '270', 'custom'] as const;

export const convertSchema = z.object({
  outputFormat: z.enum(imageOutputFormats, {
    errorMap: () => ({ message: 'outputFormat must be one of: image/png, image/jpeg, image/webp, image/avif' }),
  }),
  quality: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 90))
    .pipe(z.number().min(10).max(100)),
});

export const compressSchema = z.object({
  quality: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 75))
    .pipe(z.number().min(10).max(100)),
  removeMetadata: z
    .string()
    .optional()
    .transform((v) => v !== 'false'),
});

export const resizeSchema = z.object({
  width: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().min(1).max(10000)),
  height: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().min(1).max(10000)),
  maintainAspect: z
    .string()
    .optional()
    .transform((v) => v !== 'false'),
});

export const rotateSchema = z.object({
  angle: z.enum(rotateAngles),
  customAngle: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 45))
    .pipe(z.number().min(1).max(359)),
});

export const flipSchema = z.object({
  direction: z.enum(flipDirections),
});

export const cropSchema = z.object({
  cropX: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().min(0)),
  cropY: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().min(0)),
  cropWidth: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().min(1)),
  cropHeight: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().min(1)),
});
