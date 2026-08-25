import 'dotenv/config';
import path from 'path';

export const env = {
  port: parseInt(process.env['PORT'] ?? '5000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  isDev: (process.env['NODE_ENV'] ?? 'development') === 'development',
  corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
  maxImageSizeMb: parseInt(process.env['MAX_IMAGE_SIZE_MB'] ?? '50', 10),
  maxPdfSizeMb: parseInt(process.env['MAX_PDF_SIZE_MB'] ?? '100', 10),
  tempCleanupDelayMs: parseInt(process.env['TEMP_CLEANUP_DELAY_MS'] ?? '5000', 10),
  gsPath: process.env['GS_PATH'] ?? 'gswin64c',
  tempUploadsDir: path.resolve(process.cwd(), 'temp', 'uploads'),
  tempGeneratedDir: path.resolve(process.cwd(), 'temp', 'generated'),
} as const;
