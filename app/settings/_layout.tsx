import { Stack } from "expo-router";
import { ProtectedRoute } from "@components/auth/ProtectedRoute";

/**
 * SettingsLayout
 * Middleware for all settings routes.
 */
export default function SettingsLayout() {
  return (
    <ProtectedRoute>
      <Stack screenOptions={{ headerShown: false }} />
    </ProtectedRoute>
  );
}
