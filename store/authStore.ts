import { create } from "zustand";
import type { OnboardingData } from "@/types/auth";

interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  signUpType?: string;
  category: string[];
  profileImage?: string;
  location?: string;
  isProfileCompleted: boolean;
}

interface AuthStore {
  /** Currently logged-in user, or null if unauthenticated */
  user: User | null;
  /** Auth token for API requests */
  token: string | null;
  /**
   * setAuth — called after successful login/signup
   * @param user  - user object from the API
   * @param token - JWT or session token
   */
  setAuth: (user: User, token: string) => void;
  /**
   * logout — clears user and token, caller should navigate to /welcome
   */
  logout: () => void;
  /**
   * updateUser — partial update of the current user object
   */
  updateUser: (userData: Partial<User>) => void;
  /**
   * Temporary un-persisted data collected during onboarding
   */
  onboardingData: OnboardingData;
  /**
   * Save progressive onboarding steps
   */
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  /**
   * Clear onboarding data after successful completion
   */
  clearOnboardingData: () => void;
}

/**
 * useAuthStore
 * Authentication session store.
 *
 * Usage (always use selectors):
 *   const user = useAuthStore(s => s.user);
 *   const logout = useAuthStore(s => s.logout);
 *
 * Token is automatically available to services/api.ts via authHeaders()
 */
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  onboardingData: {},

  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null, onboardingData: {} }),
  updateUser: (userData) => 
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null
    })),
  setOnboardingData: (data) =>
    set((state) => ({ onboardingData: { ...state.onboardingData, ...data } })),
  clearOnboardingData: () => set({ onboardingData: {} }),
}));
