import { create } from "zustand";

interface ModalStore {
  /** Which modal is currently open (null = none) */
  activeModal: string | null;
  /** Temporary data passed into the modal — always wiped on close */
  modalData: Record<string, unknown>;
  /**
   * openModal — opens a modal by name with optional data
   * @param name - modal identifier (e.g. 'hirePerson', 'imageViewer')
   * @param data - temp data available inside the modal (cleaned on close)
   */
  openModal: (name: string, data?: Record<string, unknown>) => void;
  /**
   * closeModal — closes the active modal and wipes all modal data
   * Always use this to close; never manually set activeModal to null
   */
  closeModal: () => void;
}

/**
 * useModalStore
 * Global modal orchestration store.
 *
 * Usage:
 *   const { openModal, closeModal, modalData } = useModalStore(s => ({
 *     openModal: s.openModal,
 *     closeModal: s.closeModal,
 *     modalData: s.modalData,
 *   }), shallow);
 *
 *   // Open:  openModal('hirePerson', { userId: '123' })
 *   // Close: closeModal()  ← clears data automatically
 */
export const useModalStore = create<ModalStore>((set) => ({
  activeModal: null,
  modalData: {},

  openModal: (name, data = {}) =>
    set({ activeModal: name, modalData: data }),

  closeModal: () =>
    set({ activeModal: null, modalData: {} }), // Always wipes data
}));
