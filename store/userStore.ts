import { create } from "zustand";
import type { UserProfile, Subscription } from "@/types/auth";

interface UserStore {
  /** Full response from /me stored as userData */
  userData: {
    user: UserProfile;
    subscription: Subscription | null;
  } | null;
  /** Set full userData from /me response */
  setUserData: (user: UserProfile, subscription?: Subscription | null) => void;
  /** Clear user data on logout */
  clearUser: () => void;
}

/**
 * useUserStore
 * Stores the full user profile and subscription fetched from /me.
 *
 * Usage:
 *   const userData = useUserStore(s => s.userData);
 *   const profile = userData?.user;
 *   const subscription = userData?.subscription;
 */
export const useUserStore = create<UserStore>((set) => ({
  userData: null,

  setUserData: (user, subscription = null) =>
    set({ userData: { user, subscription } }),

  clearUser: () => set({ userData: null }),
}));
