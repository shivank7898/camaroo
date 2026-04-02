import "../global.css";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Outfit_400Regular, Outfit_500Medium, Outfit_700Bold } from "@expo-google-fonts/outfit";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import { usePortfolioListener } from "@hooks/usePortfolioListener";
import { useRouter } from "expo-router";

const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  usePortfolioListener(queryClient);

  // Navigate to profile when user taps an upload notification
  const router = useRouter();
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data?.screen;
      if (screen === 'profile') {
        router.push('/(tabs)/profile');
      }
    });
    return () => subscription.remove();
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </QueryClientProvider>
  );
}
