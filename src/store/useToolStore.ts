import { create } from 'zustand';
import type { UploadedFile, ProcessingResult, ProcessingStatus, ToolSettingField } from '../types';

interface ToolStoreState {
  files: UploadedFile[];
  status: ProcessingStatus;
  progress: number;
  error: string | null;
  result: ProcessingResult | null;
  settings: Record<string, string | number | boolean>;
  processingTimer: ReturnType<typeof setTimeout> | null;
}

interface ToolStoreActions {
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
  replaceFile: (id: string, newFile: File) => void;
  clearFiles: () => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
  initSettings: (fields: ToolSettingField[]) => void;
  updateSetting: (id: string, value: string | number | boolean) => void;
  startProcessing: () => void;
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
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        uploaded.preview = url;

        const img = new window.Image();
        img.onload = () => {
          uploaded.dimensions = { width: img.width, height: img.height };
          resolve(uploaded);
        };
        img.onerror = () => resolve(uploaded);
        img.src = url;
      };
      reader.onerror = () => resolve(uploaded);
      reader.readAsDataURL(file);
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
  processingTimer: null,
};

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
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    set({ files: [], result: null, status: 'idle', error: null });
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

  updateSetting: (id: string, value: string | number | boolean) => {
    set((state) => ({
      settings: { ...state.settings, [id]: value },
    }));
  },

  startProcessing: () => {
    const { files } = get();
    if (files.length === 0) return;

    set({ status: 'uploading', progress: 0, error: null, result: null });

    const stages: { status: ProcessingStatus; duration: number; progress: number }[] = [
      { status: 'uploading', duration: 300, progress: 10 },
      { status: 'validating', duration: 400, progress: 25 },
      { status: 'preparing', duration: 300, progress: 40 },
      { status: 'processing', duration: 800, progress: 70 },
      { status: 'processing', duration: 600, progress: 90 },
      { status: 'completed', duration: 200, progress: 100 },
    ];

    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    stages.forEach((stage) => {
      elapsed += stage.duration;
      const timer = setTimeout(() => {
        const currentState = get();
        if (currentState.status === 'idle') return;

        if (stage.status === 'completed') {
          const totalSize = currentState.files.reduce((sum, f) => sum + f.size, 0);
          const savings = Math.floor(Math.random() * 30) + 10;
          const resultSize = Math.floor(totalSize * (1 - savings / 100));

          set({
            status: 'completed',
            progress: 100,
            result: {
              fileName: currentState.files[0].name.replace(/\.[^.]+$/, '_processed.png'),
              fileSize: resultSize,
              originalSize: totalSize,
              savings,
              blob: new Blob(['simulated-output'], { type: 'application/octet-stream' }),
            },
          });
        } else {
          set({ status: stage.status, progress: stage.progress });
        }
      }, elapsed);
      timers.push(timer);
    });

    set({ processingTimer: timers[0] });
  },

  cancelProcessing: () => {
    set({
      status: 'idle',
      progress: 0,
      error: null,
      result: null,
      processingTimer: null,
    });
  },

  retryProcessing: () => {
    get().startProcessing();
  },

  reset: () => {
    const { files } = get();
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    set({ ...initialState });
  },

  setError: (error: string) => {
    set({ status: 'failed', error, progress: 0 });
  },
}));
