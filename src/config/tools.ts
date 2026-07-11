import type { Tool, CategoryOption, ToolCategory } from '../types';

/* =============================================
   IMAGE FORMAT CONSTANTS
   ============================================= */
const IMAGE_FORMATS = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/bmp', 'image/tiff', 'image/svg+xml'];
const IMAGE_MAX_SIZE = 50 * 1024 * 1024; // 50MB
const PDF_FORMATS = ['application/pdf'];
const PDF_MAX_SIZE = 100 * 1024 * 1024; // 100MB

/* =============================================
   TOOLS CONFIGURATION
   ============================================= */
export const tools: Tool[] = [
  /* ─────────────── IMAGE TOOLS ─────────────── */
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert images between PNG, JPG, WebP, AVIF and more formats locally.',
    icon: 'ImageDown',
    route: '/tool/image-converter',
    category: 'image',
    status: 'active',
    inputType: 'file',
    acceptedFormats: IMAGE_FORMATS,
    maxFileSize: IMAGE_MAX_SIZE,
    settings: [
      {
        id: 'outputFormat',
        label: 'Output Format',
        type: 'select',
        defaultValue: 'image/png',
        options: [
          { value: 'image/png', label: 'PNG' },
          { value: 'image/jpeg', label: 'JPG' },
          { value: 'image/webp', label: 'WebP' },
          { value: 'image/avif', label: 'AVIF' },
        ],
      },
      {
        id: 'quality',
        label: 'Quality',
        type: 'slider',
        defaultValue: 90,
        min: 10,
        max: 100,
        step: 5,
        suffix: '%',
      },
    ],
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Compress and optimize images without visible quality loss. All processing stays local.',
    icon: 'FileDown',
    route: '/tool/image-compressor',
    category: 'image',
    status: 'active',
    inputType: 'file',
    acceptedFormats: IMAGE_FORMATS,
    maxFileSize: IMAGE_MAX_SIZE,
    settings: [
      {
        id: 'quality',
        label: 'Compression Quality',
        type: 'slider',
        defaultValue: 75,
        min: 10,
        max: 100,
        step: 5,
        suffix: '%',
      },
      {
        id: 'removeMetadata',
        label: 'Remove Metadata',
        type: 'toggle',
        defaultValue: true,
      },
    ],
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize images to exact dimensions while maintaining quality.',
    icon: 'Scaling',
    route: '/tool/image-resizer',
    category: 'image',
    status: 'active',
    inputType: 'file',
    acceptedFormats: IMAGE_FORMATS,
    maxFileSize: IMAGE_MAX_SIZE,
    settings: [
      {
        id: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: 1920,
        min: 1,
        max: 10000,
        suffix: 'px',
      },
      {
        id: 'height',
        label: 'Height',
        type: 'number',
        defaultValue: 1080,
        min: 1,
        max: 10000,
        suffix: 'px',
      },
      {
        id: 'maintainAspect',
        label: 'Maintain Aspect Ratio',
        type: 'toggle',
        defaultValue: true,
      },
    ],
  },
  {
    id: 'crop-image',
    name: 'Crop Image',
    description: 'Crop images to custom dimensions. Select your crop area precisely.',
    icon: 'Crop',
    route: '/tool/crop-image',
    category: 'image',
    status: 'active',
    inputType: 'file',
    acceptedFormats: IMAGE_FORMATS,
    maxFileSize: IMAGE_MAX_SIZE,
    settings: [
      {
        id: 'cropX',
        label: 'X Offset',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 10000,
        suffix: 'px',
      },
      {
        id: 'cropY',
        label: 'Y Offset',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 10000,
        suffix: 'px',
      },
      {
        id: 'cropWidth',
        label: 'Crop Width',
        type: 'number',
        defaultValue: 800,
        min: 1,
        max: 10000,
        suffix: 'px',
      },
      {
        id: 'cropHeight',
        label: 'Crop Height',
        type: 'number',
        defaultValue: 600,
        min: 1,
        max: 10000,
        suffix: 'px',
      },
    ],
  },
  {
    id: 'rotate-image',
    name: 'Rotate Image',
    description: 'Rotate images by any angle. Quick presets for 90°, 180°, 270°.',
    icon: 'RotateCw',
    route: '/tool/rotate-image',
    category: 'image',
    status: 'active',
    inputType: 'file',
    acceptedFormats: IMAGE_FORMATS,
    maxFileSize: IMAGE_MAX_SIZE,
    settings: [
      {
        id: 'angle',
        label: 'Rotation Angle',
        type: 'select',
        defaultValue: '90',
        options: [
          { value: '90', label: '90° Clockwise' },
          { value: '180', label: '180°' },
          { value: '270', label: '270° Clockwise' },
          { value: 'custom', label: 'Custom Angle' },
        ],
      },
      {
        id: 'customAngle',
        label: 'Custom Angle',
        type: 'slider',
        defaultValue: 45,
        min: 1,
        max: 359,
        step: 1,
        suffix: '°',
      },
    ],
  },
  {
    id: 'flip-image',
    name: 'Flip Image',
    description: 'Flip images horizontally or vertically with a single click.',
    icon: 'FlipHorizontal',
    route: '/tool/flip-image',
    category: 'image',
    status: 'active',
    inputType: 'file',
    acceptedFormats: IMAGE_FORMATS,
    maxFileSize: IMAGE_MAX_SIZE,
    settings: [
      {
        id: 'direction',
        label: 'Flip Direction',
        type: 'select',
        defaultValue: 'horizontal',
        options: [
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' },
          { value: 'both', label: 'Both' },
        ],
      },
    ],
  },
  {
    id: 'convert-to-png',
    name: 'Convert to PNG',
    description: 'Convert any image to PNG format with lossless quality.',
    icon: 'FileImage',
    route: '/tool/convert-to-png',
    category: 'image',
    status: 'active',
    inputType: 'file',
    acceptedFormats: IMAGE_FORMATS,
    maxFileSize: IMAGE_MAX_SIZE,
    settings: [],
  },
  {
    id: 'convert-to-jpg',
    name: 'Convert to JPG',
    description: 'Convert any image to JPG format with adjustable quality.',
    icon: 'FileImage',
    route: '/tool/convert-to-jpg',
    category: 'image',
    status: 'active',
    inputType: 'file',
    acceptedFormats: IMAGE_FORMATS,
    maxFileSize: IMAGE_MAX_SIZE,
    settings: [
      {
        id: 'quality',
        label: 'JPG Quality',
        type: 'slider',
        defaultValue: 90,
        min: 10,
        max: 100,
        step: 5,
        suffix: '%',
      },
    ],
  },
  {
    id: 'convert-to-webp',
    name: 'Convert to WebP',
    description: 'Convert any image to WebP for smaller file sizes on the web.',
    icon: 'FileImage',
    route: '/tool/convert-to-webp',
    category: 'image',
    status: 'active',
    inputType: 'file',
    acceptedFormats: IMAGE_FORMATS,
    maxFileSize: IMAGE_MAX_SIZE,
    settings: [
      {
        id: 'quality',
        label: 'WebP Quality',
        type: 'slider',
        defaultValue: 85,
        min: 10,
        max: 100,
        step: 5,
        suffix: '%',
      },
    ],
  },
  {
    id: 'convert-to-avif',
    name: 'Convert to AVIF',
    description: 'Convert images to AVIF — the most efficient modern image format.',
    icon: 'FileImage',
    route: '/tool/convert-to-avif',
    category: 'image',
    status: 'active',
    inputType: 'file',
    acceptedFormats: IMAGE_FORMATS,
    maxFileSize: IMAGE_MAX_SIZE,
    settings: [
      {
        id: 'quality',
        label: 'AVIF Quality',
        type: 'slider',
        defaultValue: 80,
        min: 10,
        max: 100,
        step: 5,
        suffix: '%',
      },
    ],
  },

  /* ─────────────── PDF TOOLS ─────────────── */
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into a single document. Drag to reorder.',
    icon: 'FilePlus2',
    route: '/tool/merge-pdf',
    category: 'pdf',
    status: 'active',
    inputType: 'file',
    acceptedFormats: PDF_FORMATS,
    maxFileSize: PDF_MAX_SIZE,
    multiFile: true,
    settings: [],
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Split a PDF into multiple files by page range.',
    icon: 'Scissors',
    route: '/tool/split-pdf',
    category: 'pdf',
    status: 'active',
    inputType: 'file',
    acceptedFormats: PDF_FORMATS,
    maxFileSize: PDF_MAX_SIZE,
    settings: [
      {
        id: 'pageRange',
        label: 'Page Range',
        type: 'text',
        defaultValue: '1-5',
        placeholder: 'e.g. 1-3, 5, 8-10',
      },
    ],
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining document quality.',
    icon: 'FileDown',
    route: '/tool/compress-pdf',
    category: 'pdf',
    status: 'active',
    inputType: 'file',
    acceptedFormats: PDF_FORMATS,
    maxFileSize: PDF_MAX_SIZE,
    settings: [
      {
        id: 'compressionLevel',
        label: 'Compression Level',
        type: 'select',
        defaultValue: 'medium',
        options: [
          { value: 'low', label: 'Low — Better Quality' },
          { value: 'medium', label: 'Medium — Balanced' },
          { value: 'high', label: 'High — Smaller Size' },
        ],
      },
    ],
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'Rotate PDF pages by 90°, 180° or 270°.',
    icon: 'RotateCw',
    route: '/tool/rotate-pdf',
    category: 'pdf',
    status: 'active',
    inputType: 'file',
    acceptedFormats: PDF_FORMATS,
    maxFileSize: PDF_MAX_SIZE,
    settings: [
      {
        id: 'angle',
        label: 'Rotation',
        type: 'select',
        defaultValue: '90',
        options: [
          { value: '90', label: '90° Clockwise' },
          { value: '180', label: '180°' },
          { value: '270', label: '270° Clockwise' },
        ],
      },
      {
        id: 'pages',
        label: 'Apply To Pages',
        type: 'text',
        defaultValue: 'all',
        placeholder: 'all, or 1-3, 5',
      },
    ],
  },
  {
    id: 'images-to-pdf',
    name: 'Images to PDF',
    description: 'Convert multiple images into a single PDF document.',
    icon: 'FileUp',
    route: '/tool/images-to-pdf',
    category: 'pdf',
    status: 'active',
    inputType: 'file',
    acceptedFormats: IMAGE_FORMATS,
    maxFileSize: IMAGE_MAX_SIZE,
    multiFile: true,
    settings: [
      {
        id: 'pageSize',
        label: 'Page Size',
        type: 'select',
        defaultValue: 'a4',
        options: [
          { value: 'a4', label: 'A4' },
          { value: 'letter', label: 'US Letter' },
          { value: 'fit', label: 'Fit to Image' },
        ],
      },
      {
        id: 'orientation',
        label: 'Orientation',
        type: 'select',
        defaultValue: 'portrait',
        options: [
          { value: 'portrait', label: 'Portrait' },
          { value: 'landscape', label: 'Landscape' },
        ],
      },
    ],
  },
  {
    id: 'pdf-to-images',
    name: 'PDF to Images',
    description: 'Extract every page of a PDF as individual images.',
    icon: 'Images',
    route: '/tool/pdf-to-images',
    category: 'pdf',
    status: 'active',
    inputType: 'file',
    acceptedFormats: PDF_FORMATS,
    maxFileSize: PDF_MAX_SIZE,
    settings: [
      {
        id: 'outputFormat',
        label: 'Image Format',
        type: 'select',
        defaultValue: 'image/png',
        options: [
          { value: 'image/png', label: 'PNG' },
          { value: 'image/jpeg', label: 'JPG' },
          { value: 'image/webp', label: 'WebP' },
        ],
      },
      {
        id: 'quality',
        label: 'Quality',
        type: 'slider',
        defaultValue: 90,
        min: 10,
        max: 100,
        step: 5,
        suffix: '%',
      },
    ],
  },

  /* ─────────────── QR TOOLS ─────────────── */
  {
    id: 'qr-generator',
    name: 'QR Generator',
    description: 'Generate real QR codes locally. Customize colors, size and download as PNG.',
    icon: 'QrCode',
    route: '/tool/qr-generator',
    category: 'qr',
    status: 'active',
    inputType: 'text',
    settings: [
      {
        id: 'size',
        label: 'QR Size',
        type: 'slider',
        defaultValue: 300,
        min: 100,
        max: 1000,
        step: 50,
        suffix: 'px',
      },
      {
        id: 'fgColor',
        label: 'Foreground Color',
        type: 'color',
        defaultValue: '#111111',
      },
      {
        id: 'bgColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#FFFFFF',
      },
    ],
  },

  /* ─────────────── COMING SOON ─────────────── */
  {
    id: 'video-converter',
    name: 'Video Converter',
    description: 'Convert videos between MP4, WebM, AVI and more formats locally.',
    icon: 'Video',
    route: '/tool/video-converter',
    category: 'video',
    status: 'coming-soon',
    inputType: 'none',
  },
  {
    id: 'video-compressor',
    name: 'Video Compressor',
    description: 'Compress video files while maintaining visual quality.',
    icon: 'FileDown',
    route: '/tool/video-compressor',
    category: 'video',
    status: 'coming-soon',
    inputType: 'none',
  },
  {
    id: 'trim-video',
    name: 'Trim Video',
    description: 'Cut and trim video files to the exact segment you need.',
    icon: 'Scissors',
    route: '/tool/trim-video',
    category: 'video',
    status: 'coming-soon',
    inputType: 'none',
  },
  {
    id: 'audio-converter',
    name: 'Audio Converter',
    description: 'Convert audio files between MP3, WAV, FLAC, OGG and more.',
    icon: 'AudioLines',
    route: '/tool/audio-converter',
    category: 'audio',
    status: 'coming-soon',
    inputType: 'none',
  },
  {
    id: 'trim-audio',
    name: 'Trim Audio',
    description: 'Cut and trim audio files to the exact clip you need.',
    icon: 'Scissors',
    route: '/tool/trim-audio',
    category: 'audio',
    status: 'coming-soon',
    inputType: 'none',
  },
  {
    id: 'merge-audio',
    name: 'Merge Audio',
    description: 'Combine multiple audio files into a single track.',
    icon: 'FilePlus2',
    route: '/tool/merge-audio',
    category: 'audio',
    status: 'coming-soon',
    inputType: 'none',
  },
  {
    id: 'favicon-generator',
    name: 'Favicon Generator',
    description: 'Create favicons in all required sizes from a single source image.',
    icon: 'Gem',
    route: '/tool/favicon-generator',
    category: 'utility',
    status: 'coming-soon',
    inputType: 'none',
  },
  {
    id: 'barcode-generator',
    name: 'Barcode Generator',
    description: 'Generate barcodes in Code128, EAN, UPC and other formats.',
    icon: 'Barcode',
    route: '/tool/barcode-generator',
    category: 'utility',
    status: 'coming-soon',
    inputType: 'none',
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate and beautify JSON data instantly.',
    icon: 'Braces',
    route: '/tool/json-formatter',
    category: 'utility',
    status: 'coming-soon',
    inputType: 'none',
  },
  {
    id: 'base64-encoder',
    name: 'Base64 Encoder',
    description: 'Encode text or files to Base64 format.',
    icon: 'Binary',
    route: '/tool/base64-encoder',
    category: 'utility',
    status: 'coming-soon',
    inputType: 'none',
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256 and other hash values.',
    icon: 'Hash',
    route: '/tool/hash-generator',
    category: 'utility',
    status: 'coming-soon',
    inputType: 'none',
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate universally unique identifiers (UUID v4).',
    icon: 'Fingerprint',
    route: '/tool/uuid-generator',
    category: 'utility',
    status: 'coming-soon',
    inputType: 'none',
  },
];

/* =============================================
   CATEGORIES
   ============================================= */
export const categories: CategoryOption[] = [
  { value: 'all', label: 'All Tools' },
  { value: 'image', label: 'Image' },
  { value: 'pdf', label: 'PDF' },
  { value: 'qr', label: 'QR Code' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'utility', label: 'Utility' },
];

/* =============================================
   HELPERS
   ============================================= */
export function getToolById(id: string): Tool | undefined {
  return tools.find((t) => t.id === id);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  if (category === 'all') return tools;
  return tools.filter((t) => t.category === category);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function getAcceptString(formats: string[]): Record<string, string[]> {
  const accept: Record<string, string[]> = {};
  formats.forEach((f) => {
    accept[f] = [];
  });
  return accept;
}
