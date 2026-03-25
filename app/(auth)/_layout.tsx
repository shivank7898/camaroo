import { Stack, Redirect, useSegments } from 'expo-router';
import { useAuthStore } from '@store/authStore';

export default function AuthLayout() {
  const token = useAuthStore((s) => s.token);
  const isProfileCompleted = useAuthStore((s) => s.user?.isProfileCompleted);
  const segments = useSegments() as any;

  if (token) {
    if (isProfileCompleted) {
      // If fully logged in, any attempt to access auth pages redirects to home
      return <Redirect href="/(tabs)" />;
    } else {
      // If logged in but profile incomplete, redirect to onboarding
      return <Redirect href="/onboarding/role" />;
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
