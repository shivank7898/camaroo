import React from "react";
import { View, ActivityIndicator } from "react-native";
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
 *
 * Waits for AsyncStorage hydration before checking auth to prevent flash redirects.
 */
export function ProtectedRoute({ children, requireProfile = true }: ProtectedRouteProps) {
  const token = useAuthStore((s) => s.token);
  const isProfileCompleted = useAuthStore((s) => s.user?.isProfileCompleted);
  const hasHydrated = useAuthStore((s) => (s as any)._hasHydrated ?? true);

  // Wait for persisted state to load from AsyncStorage
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    // Check if persist API is available (zustand persist middleware)
    const persistApi = (useAuthStore as any).persist;
    if (persistApi?.hasHydrated?.()) {
      setHydrated(true);
    } else if (persistApi?.onFinishHydration) {
      persistApi.onFinishHydration(() => setHydrated(true));
    } else {
      // Fallback: no persist middleware, consider hydrated
      setHydrated(true);
    }
  }, []);

  // Show a loading spinner while AsyncStorage is loading
  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

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
