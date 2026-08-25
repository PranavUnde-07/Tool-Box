import { create } from 'zustand';
import { processFiles } from '../services/toolApi';
import { extractApiError } from '../services/apiClient';
import type { UploadedFile, ProcessingResult, ProcessingStatus, ToolSettingField } from '../types';

interface ToolStoreState {
  files: UploadedFile[];
  status: ProcessingStatus;
  progress: number;
  error: string | null;
  result: ProcessingResult | null;
  settings: Record<string, string | number | boolean>;
  activeToolId: string | null;
  abortController: AbortController | null;
}

interface ToolStoreActions {
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
  replaceFile: (id: string, newFile: File) => void;
  clearFiles: () => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
  initSettings: (fields: ToolSettingField[]) => void;
  setActiveTool: (toolId: string | null) => void;
  updateSetting: (id: string, value: string | number | boolean) => void;
  startProcessing: () => Promise<void>;
  cancelProcessing: () => void;
  retryProcessing: () => void;
  reset: () => void;
  setError: (error: string) => void;
}

type ToolStore = ToolStoreState & ToolStoreActions;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createFilePreview(file: File): Promise<UploadedFile> {
  return new Promise((resolve) => {
    const uploaded: UploadedFile = {
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    };

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      uploaded.preview = url;

      const img = new window.Image();
      img.onload = () => {
        uploaded.dimensions = { width: img.width, height: img.height };
        resolve(uploaded);
      };
      img.onerror = () => resolve(uploaded);
      img.src = url;
    } else {
      resolve(uploaded);
    }
  });
}

const initialState: ToolStoreState = {
  files: [],
  status: 'idle',
  progress: 0,
  error: null,
  result: null,
  settings: {},
  activeToolId: null,
  abortController: null,
};

/** Release object-URL previews to avoid memory leaks. */
function revokePreviews(files: UploadedFile[]): void {
  for (const f of files) {
    if (f.preview) URL.revokeObjectURL(f.preview);
  }
}

export const useToolStore = create<ToolStore>((set, get) => ({
  ...initialState,

  addFiles: async (newFiles: File[]) => {
    const uploadedFiles = await Promise.all(newFiles.map(createFilePreview));
    set((state) => ({
      files: [...state.files, ...uploadedFiles],
      status: 'idle',
      error: null,
      result: null,
    }));
  },

  removeFile: (id: string) => {
    set((state) => {
      const file = state.files.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return {
        files: state.files.filter((f) => f.id !== id),
        result: null,
        status: 'idle',
      };
    });
  },

  replaceFile: async (id: string, newFile: File) => {
    const uploaded = await createFilePreview(newFile);
    set((state) => {
      const oldFile = state.files.find((f) => f.id === id);
      if (oldFile?.preview) {
        URL.revokeObjectURL(oldFile.preview);
      }
      return {
        files: state.files.map((f) => (f.id === id ? { ...uploaded, id } : f)),
        result: null,
        status: 'idle',
      };
    });
  },

  clearFiles: () => {
    const { files } = get();
    revokePreviews(files);
    set({ files: [], result: null, status: 'idle', error: null, progress: 0 });
  },

  reorderFiles: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const newFiles = [...state.files];
      const [moved] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, moved);
      return { files: newFiles };
    });
  },

  initSettings: (fields: ToolSettingField[]) => {
    const settings: Record<string, string | number | boolean> = {};
    fields.forEach((field) => {
      settings[field.id] = field.defaultValue;
    });
    set({ settings });
  },

  setActiveTool: (toolId: string | null) => {
    set({ activeToolId: toolId });
  },

  updateSetting: (id: string, value: string | number | boolean) => {
    set((state) => ({
      settings: { ...state.settings, [id]: value },
    }));
  },

  startProcessing: async () => {
    const { files, activeToolId, status, abortController } = get();
    if (files.length === 0 || !activeToolId) return;
    if (status === 'uploading' || status === 'processing') return;

    abortController?.abort();
    const controller = new AbortController();

    set({
      status: 'uploading',
      progress: 0,
      error: null,
      result: null,
      abortController: controller,
    });

    try {
      // Phase 1 — upload with real progress
      const { blob, fileName } = await processFiles({
        toolId: activeToolId,
        files: files.map((f) => f.file),
        settings: get().settings,
        signal: controller.signal,
        onUploadProgress: (percent) => {
          set({ progress: Math.min(80, Math.max(1, Math.round(percent * 0.8))) });
        },
      });

      // Upload finished — server is processing
      if (!controller.signal.aborted) {
        set({ status: 'processing', progress: 90 });
      }

      const originalSize = files.reduce((sum, f) => sum + f.size, 0);
      const savings =
        originalSize > 0 && blob.size < originalSize
          ? Math.round(((originalSize - blob.size) / originalSize) * 100)
          : 0;

      set({
        status: 'completed',
        progress: 100,
        abortController: null,
        result: {
          fileName,
          fileSize: blob.size,
          originalSize,
          savings,
          blob,
        },
      });
    } catch (err) {
      // Cancelled by the user — silently return to idle
      if (controller.signal.aborted) {
        set({ status: 'idle', progress: 0, error: null, abortController: null });
        return;
      }

      const message = await extractApiError(err);
      set({ status: 'failed', error: message, progress: 0, abortController: null });
    }
  },

  cancelProcessing: () => {
    get().abortController?.abort();
    set({
      status: 'idle',
      progress: 0,
      error: null,
      result: null,
      abortController: null,
    });
  },

  retryProcessing: () => {
    void get().startProcessing();
  },

  reset: () => {
    get().abortController?.abort();
    const { files } = get();
    revokePreviews(files);
    set({ ...initialState });
  },

  setError: (error: string) => {
    set({ status: 'failed', error, progress: 0 });
  },
}));
