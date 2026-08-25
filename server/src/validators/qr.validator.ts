import { z } from 'zod';

const hexColor = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const qrFormats = ['png', 'svg'] as const;

export const generateSchema = z.object({
  text: z.string().min(1, 'text is required').max(2048, 'text exceeds 2048 character limit'),
  size: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 300))
    .pipe(z.number().min(100).max(1000)),
  fgColor: z
    .string()
    .optional()
    .default('#111111')
    .pipe(z.string().regex(hexColor, 'fgColor must be a valid hex color')),
  bgColor: z
    .string()
    .optional()
    .default('#FFFFFF')
    .pipe(z.string().regex(hexColor, 'bgColor must be a valid hex color')),
  format: z.enum(qrFormats).optional().default('png'),
});
