import React from "react";
import { View, Text, Platform } from "react-native";
import GoogleSignInButton from "@components/auth/GoogleSignInButton";
import { SocialButton } from "@components/SocialButton";

interface SocialLoginRowProps {
  onGooglePress: () => void;
  onApplePress: () => void;
  disabled?: boolean;
}

function SocialLoginRow({ onGooglePress, onApplePress, disabled }: SocialLoginRowProps) {
  return (
    <>
      <View className="flex-row items-center justify-center my-4">
        <View className="flex-1 h-[1px] bg-white/10" />
        <Text className="text-text-secondary font-outfit-medium mx-4">or</Text>
        <View className="flex-1 h-[1px] bg-white/10" />
      </View>

      <View className="flex-row items-center justify-center mb-6">
        <GoogleSignInButton onPress={onGooglePress} disabled={disabled} />
        {Platform.OS === "ios" && (
          <SocialButton provider="Apple" onPress={onApplePress} />
        )}
      </View>
    </>
  );
}

export default React.memo(SocialLoginRow);
