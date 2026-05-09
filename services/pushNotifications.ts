import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { apiRequest } from "./api";

// Ask permission + get Expo push token
export const registerPushToken = async (): Promise<string | null> => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return null;
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;     // e.g. "ExponentPushToken[xxx]"
  } catch (error) {
    console.warn("Failed to get push token", error);
    return null;
  }
};

// Call this once after login to send token to backend
export const syncPushTokenWithBackend = async (token: string) => {
  try {
    await apiRequest({
      url: "/me/push-token",        // backend saves it per user
      method: "POST",
      payload: { pushToken: token },
    });
  } catch (error) {
    console.warn("Failed to sync push token with server", error);
  }
};

// Set foreground behaviour: show banner + sound while app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Handle notification tap → navigate to the right chat room
export const setupNotificationTapHandler = () => {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    
    // Original profile logic if it exists
    if (data?.screen === 'profile') {
      router.push('/(tabs)/profile');
      return;
    }

    // Chat deep linking
    const conversationId = data?.conversationId as string | undefined;
    if (conversationId) {
      router.push({ pathname: "/chat/[id]", params: { id: conversationId } });
    }
  });
};
