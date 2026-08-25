import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { env } from '../config/env';
import { ensureDir, scheduleCleanup } from '../utils/fileCleanup';
import { generateFilenameWithExt } from '../utils/filenameGenerator';
import { sendError } from '../utils/responseHelpers';
import { HTTP, ERROR_CODE } from '../constants';
import { generateSchema } from '../validators/qr.validator';
import { generateQr } from '../services/qr.service';
import type { QrOutputFormat } from '../types';

ensureDir(env.tempGeneratedDir);

/* ─────────────── Generate ─────────────── */
export async function generate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = generateSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Invalid parameters', ERROR_CODE.INVALID_PARAMS, HTTP.BAD_REQUEST, parsed.error.flatten());
    return;
  }

  const { text, size, fgColor, bgColor, format } = parsed.data;
  const ext = format === 'svg' ? 'svg' : 'png';
  const outputPath = path.join(env.tempGeneratedDir, generateFilenameWithExt(ext, 'qr'));
  const downloadName = `qr-code.${ext}`;

  try {
    await generateQr({ text, size, fgColor, bgColor, format: format as QrOutputFormat, outputPath });
    res.download(outputPath, downloadName, (err) => {
      scheduleCleanup([outputPath]);
      if (err && !res.headersSent) next(err);
    });
  } catch (err) {
    scheduleCleanup([outputPath]);
    next(err);
  }
}
