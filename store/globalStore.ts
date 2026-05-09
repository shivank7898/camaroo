import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

interface GlobalStore {
  toast: { message: string; type: ToastType; visible: boolean } | null;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  toast: null,
  showToast: (message, type = "success") => set({ toast: { message, type, visible: true } }),
  hideToast: () => set((state) => state.toast ? { toast: { ...state.toast, visible: false } } : state),
}));
