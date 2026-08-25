/* =============================================
   TOOLBOX — Type Definitions
   ============================================= */

/* --- Tool Setting Field Schema --- */
export interface ToolSettingField {
  id: string;
  label: string;
  type: 'slider' | 'select' | 'toggle' | 'number' | 'text' | 'color';
  defaultValue: string | number | boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  placeholder?: string;
}

/* --- Tool Category --- */
export type ToolCategory = 'all' | 'image' | 'pdf' | 'qr' | 'video' | 'audio' | 'utility';

/* --- Tool --- */
export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  category: ToolCategory;
  status: 'active' | 'coming-soon';
  inputType: 'file' | 'text' | 'none';
  acceptedFormats?: string[];
  maxFileSize?: number;
  multiFile?: boolean;
  settings?: ToolSettingField[];
}

/* --- Category Option --- */
export interface CategoryOption {
  value: ToolCategory;
  label: string;
}

/* --- Processing --- */
export type ProcessingStatus =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed';

/* --- Uploaded File --- */
export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  dimensions?: { width: number; height: number };
}

/* --- Processing Result --- */
export interface ProcessingResult {
  fileName: string;
  fileSize: number;
  originalSize: number;
  blob?: Blob;
  url?: string;
  savings?: number;
}
