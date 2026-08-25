import { PDFDocument, degrees } from 'pdf-lib';
import sharp from 'sharp';
import archiver from 'archiver';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { ensureDir } from '../utils/fileCleanup';
import { generateFilenameWithExt } from '../utils/filenameGenerator';
import { ERROR_CODE } from '../constants';
import type {
  PdfMergeParams,
  PdfSplitParams,
  PdfCompressParams,
  PdfRotateParams,
  ImagesToPdfParams,
  PdfToImagesParams,
  PdfCompressionLevel,
} from '../types';

/* ─────────────── Ghostscript preset map ─────────────── */
const GS_PRESETS: Record<PdfCompressionLevel, string> = {
  screen: '/screen',
  ebook: '/ebook',
  printer: '/printer',
};

/* ─────────────── Compress — Ghostscript + fallback ─────────────── */
export async function compressPdf(params: PdfCompressParams): Promise<void> {
  const { inputPath, outputPath, level } = params;
  const preset = GS_PRESETS[level];

  try {
    return await runGhostscript([
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      `-dPDFSETTINGS=${preset}`,
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sOutputFile=${outputPath}`,
      inputPath,
    ]);
  } catch (err) {
    // No Ghostscript installed — fall back to lossless pdf-lib re-save.
    if ((err as NodeJS.ErrnoException).code === ERROR_CODE.GS_NOT_FOUND) {
      return compressPdfFallback(params);
    }
    throw err;
  }
}

/**
 * Lossless compression via pdf-lib: re-saves with object streams so
 * duplicate objects are deduplicated. Modest gains, but always available.
 */
async function compressPdfFallback({ inputPath, outputPath }: PdfCompressParams): Promise<void> {
  const bytes = fs.readFileSync(inputPath);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const out = await doc.save({ useObjectStreams: true });
  fs.writeFileSync(outputPath, out);
}

/* ─────────────── Merge ─────────────── */
export async function mergePdfs(params: PdfMergeParams): Promise<void> {
  const { inputPaths, outputPath } = params;

  const mergedDoc = await PDFDocument.create();

  for (const inputPath of inputPaths) {
    const bytes = fs.readFileSync(inputPath);
    const srcDoc = await PDFDocument.load(bytes);
    const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    pages.forEach((page) => mergedDoc.addPage(page));
  }

  const mergedBytes = await mergedDoc.save();
  fs.writeFileSync(outputPath, mergedBytes);
}

/* ─────────────── Split ─────────────── */
function parsePageRange(rangeStr: string, totalPages: number): number[][] {
  if (rangeStr.trim().toLowerCase() === 'all') {
    // Split every page individually
    return Array.from({ length: totalPages }, (_, i) => [i]);
  }

  const groups: number[][] = [];
  const parts = rangeStr.split(',').map((s) => s.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Math.max(1, parseInt(startStr ?? '1', 10)) - 1;
      const end = Math.min(totalPages, parseInt(endStr ?? String(totalPages), 10)) - 1;
      if (start <= end) {
        const group: number[] = [];
        for (let i = start; i <= end; i++) group.push(i);
        groups.push(group);
      }
    } else {
      const page = parseInt(part, 10) - 1;
      if (page >= 0 && page < totalPages) {
        groups.push([page]);
      }
    }
  }

  return groups;
}

export async function splitPdf(params: PdfSplitParams): Promise<string[]> {
  const { inputPath, outputDir, pageRange } = params;

  ensureDir(outputDir);

  const bytes = fs.readFileSync(inputPath);
  const srcDoc = await PDFDocument.load(bytes);
  const totalPages = srcDoc.getPageCount();

  const groups = parsePageRange(pageRange, totalPages);
  const outputPaths: string[] = [];

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    if (!group || group.length === 0) continue;

    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(srcDoc, group);
    pages.forEach((page) => newDoc.addPage(page));

    const outPath = path.join(outputDir, `part-${i + 1}.pdf`);
    const outBytes = await newDoc.save();
    fs.writeFileSync(outPath, outBytes);
    outputPaths.push(outPath);
  }

  return outputPaths;
}

/* ─────────────── Rotate ─────────────── */
function resolvePages(pagesStr: string, totalPages: number): number[] {
  if (pagesStr.trim().toLowerCase() === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const indices: number[] = [];
  const parts = pagesStr.split(',').map((s) => s.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Math.max(1, parseInt(startStr ?? '1', 10)) - 1;
      const end = Math.min(totalPages, parseInt(endStr ?? String(totalPages), 10)) - 1;
      for (let i = start; i <= end; i++) indices.push(i);
    } else {
      const page = parseInt(part, 10) - 1;
      if (page >= 0 && page < totalPages) indices.push(page);
    }
  }

  return indices;
}

export async function rotatePdf(params: PdfRotateParams): Promise<void> {
  const { inputPath, outputPath, angle, pages } = params;

  const bytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(bytes);
  const totalPages = pdfDoc.getPageCount();
  const targetIndices = resolvePages(pages, totalPages);

  for (const idx of targetIndices) {
    const page = pdfDoc.getPage(idx);
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + angle) % 360));
  }

  const outBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, outBytes);
}

/* ─────────────── Images to PDF ─────────────── */
const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
} as const;

export async function imagesToPdf(params: ImagesToPdfParams): Promise<void> {
  const { inputPaths, outputPath, pageSize, orientation } = params;

  const pdfDoc = await PDFDocument.create();

  for (const imgPath of inputPaths) {
    // Convert each image to PNG bytes via sharp for universal support
    const pngBuffer = await sharp(imgPath).png().toBuffer();
    const pngImage = await pdfDoc.embedPng(pngBuffer);
    const imgDims = pngImage.scaleToFit(612, 792);

    let pageW: number;
    let pageH: number;

    if (pageSize === 'fit') {
      pageW = imgDims.width;
      pageH = imgDims.height;
    } else {
      const dims = PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES] ?? PAGE_SIZES.a4;
      pageW = orientation === 'landscape' ? dims.height : dims.width;
      pageH = orientation === 'landscape' ? dims.width : dims.height;
    }

    const page = pdfDoc.addPage([pageW, pageH]);
    const scaled = pngImage.scaleToFit(pageW, pageH);
    const x = (pageW - scaled.width) / 2;
    const y = (pageH - scaled.height) / 2;

    page.drawImage(pngImage, { x, y, width: scaled.width, height: scaled.height });
  }

  const outBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, outBytes);
}

/* ─────────────── PDF to Images ─────────────── */
const RASTER_SCALE = 2; // ~144 DPI

/**
 * Rasterize every page of a PDF using pdf-to-img (pure Node, no external
 * binaries), then transcode each page to the requested format via sharp.
 */
export async function pdfToImages(params: PdfToImagesParams): Promise<string[]> {
  const { inputPath, outputDir, outputFormat, quality } = params;

  ensureDir(outputDir);

  // Locate pdf.js standard fonts so Standard-14 text renders correctly
  let standardFontsDataPath: string | undefined;
  try {
    const pkg = require.resolve('pdfjs-dist/package.json');
    standardFontsDataPath = path.join(path.dirname(pkg), 'standard_fonts');
  } catch {
    /* optional — embedded fonts still render */
  }

  const { pdf } = await import('pdf-to-img');
  const document = await pdf(fs.readFileSync(inputPath), {
    scale: RASTER_SCALE,
    ...(standardFontsDataPath ? { standardFontsDataPath } : {}),
  });

  const ext = outputFormat === 'image/jpeg' ? 'jpg' : outputFormat === 'image/webp' ? 'webp' : 'png';
  const outputPaths: string[] = [];
  let pageIndex = 0;

  for await (const pageImage of document) {
    pageIndex++;
    const outName = `page-${pageIndex}.${ext}`;
    const outPath = path.join(outputDir, outName);

    let pipeline = sharp(Buffer.from(pageImage));

    if (outputFormat === 'image/jpeg') {
      pipeline = pipeline.jpeg({ quality });
    } else if (outputFormat === 'image/webp') {
      pipeline = pipeline.webp({ quality });
    } else {
      pipeline = pipeline.png();
    }

    await pipeline.toFile(outPath);
    outputPaths.push(outPath);
  }

  if (outputPaths.length === 0) {
    throw new Error('PDF rasterization produced no output.');
  }

  return outputPaths;
}

/** Spawn a Ghostscript process and resolve on success; reject with a typed error otherwise. */
function runGhostscript(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const gs = spawn(env.gsPath, args);

    let stderr = '';
    gs.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    gs.on('error', (err) => {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        const gsErr = new Error('GHOSTSCRIPT_NOT_FOUND') as NodeJS.ErrnoException;
        gsErr.code = ERROR_CODE.GS_NOT_FOUND;
        reject(gsErr);
      } else {
        reject(err);
      }
    });

    gs.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Ghostscript exited with code ${code ?? 'unknown'}. ${stderr}`));
      }
    });
  });
}

/* ─────────────── Create ZIP from files ─────────────── */
export async function createZip(filePaths: string[], outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 6 } });

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);

    for (const fp of filePaths) {
      archive.file(fp, { name: path.basename(fp) });
    }

    void archive.finalize();
  });
}

export function getFileSize(filePath: string): number {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

export function generateSplitZipName(): string {
  return generateFilenameWithExt('zip', 'split');
}
