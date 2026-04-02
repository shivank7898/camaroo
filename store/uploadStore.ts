import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PortfolioUpload {
  id: string;              // background-upload ID
  fileUri: string;         // local file path
  fileUrl: string;         // final S3 URL (from pre-signed URL response)
  title: string;
  description: string;
  tags: string[];
  visibility: "public" | "private";
  mediaType: 'photo' | 'video';
  mimeType: string;
  progress: number;        // 0-100
  status: 'uploading' | 'uploaded' | 'saving' | 'failed';
  error?: string;
  uploadUrl: string;       // pre-signed URL to upload to
  coverUrl?: string;       // URL for the manually selected video thumbnail
}

interface UploadStore {
  activeUploads: Record<string, PortfolioUpload>;
  
  addUpload: (id: string, upload: Omit<PortfolioUpload, "id" | "progress" | "status">) => void;
  updateProgress: (id: string, progress: number) => void;
  updateStatus: (id: string, status: PortfolioUpload['status'], error?: string) => void;
  removeUpload: (id: string) => void;
  clearAll: () => void;
}

export const useUploadStore = create<UploadStore>()(
  persist(
    (set) => ({
      activeUploads: {},
      
      addUpload: (id, upload) => set((state) => ({
        activeUploads: {
          ...state.activeUploads,
          [id]: { ...upload, id, progress: 0, status: 'uploading' }
        }
      })),

      updateProgress: (id, progress) => set((state) => {
        if (!state.activeUploads[id]) return state;
        return {
          activeUploads: {
            ...state.activeUploads,
            [id]: { ...state.activeUploads[id], progress }
          }
        };
      }),

      updateStatus: (id, status, error) => set((state) => {
        if (!state.activeUploads[id]) return state;
        return {
          activeUploads: {
            ...state.activeUploads,
            [id]: { ...state.activeUploads[id], status, error }
          }
        };
      }),

      removeUpload: (id) => set((state) => {
        const newUploads = { ...state.activeUploads };
        delete newUploads[id];
        return { activeUploads: newUploads };
      }),

      clearAll: () => set({ activeUploads: {} }),
    }),
    {
      name: 'camaroo-upload-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
