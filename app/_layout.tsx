import "react-native-gesture-handler";
import "../global.css";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Outfit_400Regular, Outfit_500Medium, Outfit_700Bold } from "@expo-google-fonts/outfit";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from 'expo-notifications';
import { usePortfolioListener } from "@hooks/usePortfolioListener";
import { useChatSocket } from "@/hooks/useChatSocket";
import { setupNotificationTapHandler, registerPushToken, syncPushTokenWithBackend } from "@/services/pushNotifications";
import { useRouter } from "expo-router";
import { useAuthStore } from "@store/authStore";
import GlobalNotification from "@/components/ui/GlobalNotification";

const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const token = useAuthStore((state) => state.token);
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

  // Global Chat Socket Listener
  useChatSocket();

  // Handle Push Notifications Data
  const router = useRouter();

  // Tap handler (App open / Background)
  useEffect(() => {
    const subscription = setupNotificationTapHandler();
    return () => subscription.remove();
  }, []);

  // Post-Login Push Token Sync + Killed State Open
  useEffect(() => {
    if (!token) return;

    // Fast-path: register and sync to server
    registerPushToken().then((t) => {
      if (t) syncPushTokenWithBackend(t);
    });

    // Handle deep-link if app was completely killed and launched by notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      const data = response?.notification.request.content.data;
      if (data?.conversationId) {
        // slight delay to let Router mount
        setTimeout(() => {
          router.push({ pathname: "/chat/[id]", params: { id: data.conversationId as string } });
        }, 500);
      }
    });
  }, [token]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
      <GlobalNotification />
    </QueryClientProvider>
  );
}
