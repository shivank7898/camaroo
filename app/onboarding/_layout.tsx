import { Stack } from 'expo-router';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';

/**
 * OnboardingLayout
 * Protects onboarding routes while allowing users with incomplete profiles to enter.
 */
export default function OnboardingLayout() {
  return (
    <ProtectedRoute requireProfile={false}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="role" />
        <Stack.Screen name="details" />
        <Stack.Screen name="optional" />
      </Stack>
    </ProtectedRoute>
  );
}
