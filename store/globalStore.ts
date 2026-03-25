import { create } from "zustand";

type StateValue = unknown;

interface GlobalStore {
  /** Internal key-value map of all dynamic states */
  states: Record<string, StateValue>;
  /**
   * addState — registers a new key with an initial value
   * @param key   - unique state identifier
   * @param value - initial value (any type)
   */
  addState: (key: string, value: StateValue) => void;
  /**
   * updateState — updates the value of an existing key
   * @param key   - key to update
   * @param value - new value
   */
  updateState: (key: string, value: StateValue) => void;
  /**
   * removeState — deletes a single key from the store
   * @param key - key to remove
   */
  removeState: (key: string) => void;
  /**
   * clearStates — wipes all keys from the store
   */
  clearStates: () => void;
}

/**
 * useGlobalStore
 * Dynamic key-value store for any app-wide state.
 * Add any state at runtime without modifying the store interface.
 *
 * Usage:
 *   const addState    = useGlobalStore(s => s.addState);
 *   const updateState = useGlobalStore(s => s.updateState);
 *   const removeState = useGlobalStore(s => s.removeState);
 *   const clearStates = useGlobalStore(s => s.clearStates);
 *
 *   // Read a value:
 *   const value = useGlobalStore(s => s.states['myKey']);
 *
 * Rules:
 *   - Always use selectors (never select the whole store)
 *   - Use addState for first-time registration, updateState to change
 *   - Call clearStates on logout to wipe all ephemeral state
 */
export const useGlobalStore = create<GlobalStore>((set) => ({
  states: {},

  addState: (key, value) =>
    set((prev) => ({ states: { ...prev.states, [key]: value } })),

  updateState: (key, value) =>
    set((prev) => ({ states: { ...prev.states, [key]: value } })),

  removeState: (key) =>
    set((prev) => {
      const next = { ...prev.states };
      delete next[key];
      return { states: next };
    }),

  clearStates: () => set({ states: {} }),
}));
