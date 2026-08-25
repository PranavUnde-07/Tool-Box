import {
  ImageDown,
  FileDown,
  Scaling,
  Crop,
  RotateCw,
  FlipHorizontal,
  FileImage,
  FilePlus2,
  Scissors,
  FileUp,
  Images,
  QrCode,
  Video,
  AudioLines,
  Gem,
  Barcode,
  Braces,
  Binary,
  Hash,
  Fingerprint,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* Explicit icon registry — keeps lucide tree-shaking intact.
   Keys mirror the `icon` field in src/config/tools.ts. */
export const toolIcons: Record<string, LucideIcon> = {
  ImageDown,
  FileDown,
  Scaling,
  Crop,
  RotateCw,
  FlipHorizontal,
  FileImage,
  FilePlus2,
  Scissors,
  FileUp,
  Images,
  QrCode,
  Video,
  AudioLines,
  Gem,
  Barcode,
  Braces,
  Binary,
  Hash,
  Fingerprint,
};

export function getToolIcon(name: string): LucideIcon {
  return toolIcons[name] ?? Wrench;
}
