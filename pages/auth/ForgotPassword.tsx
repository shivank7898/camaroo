import { View, Text, TouchableOpacity, Animated, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Input } from "@components/Input";
import AuthCardLayout from "@components/auth/AuthCardLayout";
import GlareShimmer from "@components/auth/GlareShimmer";
import { Loader } from "@components/ui/Loader";
import { useAuthAnimation } from "@hooks/useAuthAnimation";
import { forgotPasswordMutation } from "@services/mutations";
import type { ForgotPasswordForm } from "@/types/auth";

export default function ForgotPassword() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const { control, handleSubmit } = useForm<ForgotPasswordForm>({
    defaultValues: { email: "" },
  });

  const { slideAnimRight, fadeAnim, btnSlideAnim, btnFadeAnim, glareAnim } = useAuthAnimation();
  const { mutate: sendResetToken, isPending: isSendingToken } = useMutation({ mutationFn: forgotPasswordMutation });

  const onSubmit = (data: ForgotPasswordForm) => {
    setErrorMessage("");
    sendResetToken(data, {
      onSuccess: () => {
        router.push("/(auth)/reset-password");
      },
      onError: (err: any) => {
        try {
          setErrorMessage(JSON.parse(err.message)?.message || "Failed to send reset link.");
        } catch {
          setErrorMessage(err.message || "Failed to send reset link.");
        }
      },
    });
  };

  return (
    <AuthCardLayout>
      <TouchableOpacity
        className="mt-4 ml-6 self-start p-3 rounded-full bg-white/10 border border-white/20 z-20"
        onPress={() => router.back()}
      >
        <ArrowLeft size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
        className="px-6"
      >
        <View className="p-8 rounded-2xl border border-white/20 bg-white/5 shadow-2xl relative overflow-hidden">
          <GlareShimmer glareAnim={glareAnim} />
          
          <View className="mb-10">
            <Text className="text-[32px] font-outfit-bold text-white mb-3">Reset Password</Text>
            <Text className="text-base font-outfit text-text-secondary leading-relaxed pr-4">
              Enter your email address to receive a secure password reset token.
            </Text>
          </View>

          <Animated.View style={{ transform: [{ translateX: slideAnimRight }], opacity: fadeAnim }} className="gap-4 mb-6">
            <Controller
              control={control}
              name="email"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </Animated.View>

          {errorMessage ? (
            <Animated.View style={{ transform: [{ translateY: btnSlideAnim }], opacity: btnFadeAnim }} className="mb-4">
              <Text className="text-red-500 font-outfit-medium text-left">{errorMessage}</Text>
            </Animated.View>
          ) : null}

          <Animated.View style={{ transform: [{ translateY: btnSlideAnim }], opacity: btnFadeAnim }}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleSubmit(onSubmit)} disabled={isSendingToken}>
              <LinearGradient
                colors={["#6A11CB", "#2575FC"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {isSendingToken ? <Loader /> : <Text className="font-outfit-bold text-white text-lg">Send Token</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: btnSlideAnim }], opacity: btnFadeAnim }} className="flex-row items-center justify-center mt-2">
            <Text className="font-outfit text-text-secondary text-base">Remember it? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="font-outfit-bold text-white text-base">Sign In</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </AuthCardLayout>
  );
}

const styles = StyleSheet.create({
  submitGradient: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 20,
  },
});
