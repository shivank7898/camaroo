import React from "react";
import { Redirect } from "expo-router";
import { useAuthStore } from "@store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * If true, also requires the user to have completed their profile.
   * Defaults to true.
   */
  requireProfile?: boolean;
}

/**
 * ProtectedRoute
 * A "middleware" component that handles authentication and profile completion redirects.
 * Use this in layout files to protect an entire route group.
 */
export function ProtectedRoute({ children, requireProfile = true }: ProtectedRouteProps) {
  const token = useAuthStore((s) => s.token);
  const isProfileCompleted = useAuthStore((s) => s.user?.isProfileCompleted);

  // 1. Initial Auth Check
  if (!token) {
    return <Redirect href="/login" />;
  }

  // 2. Profile Completion Check
  if (requireProfile && !isProfileCompleted) {
    return <Redirect href="/onboarding/role" />;
  }

  return <>{children}</>;
}
