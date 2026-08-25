import QRCode from 'qrcode';
import fs from 'fs';
import type { QrGenerateParams } from '../types';

/* ─────────────── Generate QR (PNG or SVG) ─────────────── */
export async function generateQr(params: QrGenerateParams): Promise<void> {
  const { text, size, fgColor, bgColor, format, outputPath } = params;

  const options = {
    width: size,
    margin: 2,
    color: {
      dark: fgColor,
      light: bgColor,
    },
    errorCorrectionLevel: 'M' as const,
  };

  if (format === 'svg') {
    const svgString = await QRCode.toString(text, {
      ...options,
      type: 'svg',
    });
    fs.writeFileSync(outputPath, svgString, 'utf-8');
  } else {
    await QRCode.toFile(outputPath, text, {
      ...options,
      type: 'png',
    });
  }
}

export function getFileSize(filePath: string): number {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}
