import React from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

interface AuthCardLayoutProps {
  children: React.ReactNode;
}

/**
 * AuthCardLayout
 * Shared full-screen layout for Login and Signup screens.
 * Renders the deep blue gradient background + glassmorphism card container.
 * Now includes KeyboardAvoidingView for unified keyboard safety.
 *
 * Props:
 *   children → content to render inside the glassy card
 */
function AuthCardLayout({ children }: AuthCardLayoutProps) {
  return (
    <View className="flex-1 bg-background">
      {/* Full-screen gradient background */}
      <LinearGradient
        colors={["#5b8fbc", "#1A2b4c", "#060D1A"]}
        locations={[0, 0.4, 1]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", zIndex: 0 }}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1">
          {children}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default React.memo(AuthCardLayout);
