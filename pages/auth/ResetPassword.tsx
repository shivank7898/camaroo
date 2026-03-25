import { View, Text, TouchableOpacity, Animated, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Input } from "@components/Input";
import AuthCardLayout from "@components/auth/AuthCardLayout";
import GlareShimmer from "@components/auth/GlareShimmer";
import { Loader } from "@components/ui/Loader";
import { useAuthAnimation } from "@hooks/useAuthAnimation";
import { resetPasswordMutation } from "@services/mutations";
import type { ResetPasswordForm } from "@/types/auth";

export default function ResetPassword() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit } = useForm<ResetPasswordForm>({
    defaultValues: { token: "", password: "" },
  });

  const { slideAnimRight, fadeAnim, btnSlideAnim, btnFadeAnim, glareAnim } = useAuthAnimation();
  const { mutate: resetPassword, isPending: isResetting } = useMutation({ mutationFn: resetPasswordMutation });

  const onSubmit = (data: ResetPasswordForm) => {
    setErrorMessage("");
    setSuccessMessage("");
    resetPassword(data, {
      onSuccess: () => {
        setSuccessMessage("Password reset successfully. Redirecting to login...");
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 2000);
      },
      onError: (err: any) => {
        try {
          setErrorMessage(JSON.parse(err.message)?.message || "Failed to reset password.");
        } catch {
          setErrorMessage(err.message || "Failed to reset password.");
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
            <Text className="text-[32px] font-outfit-bold text-white mb-3">New Password</Text>
            <Text className="text-base font-outfit text-text-secondary leading-relaxed pr-4">
              Enter the 14-digit token sent to your email and your new password.
            </Text>
          </View>

          <Animated.View style={{ transform: [{ translateX: slideAnimRight }], opacity: fadeAnim }} className="gap-4 mb-6">
            <Controller
              control={control}
              name="token"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Reset Token"
                  placeholder="Enter token"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="New Password"
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  value={value}
                  onChangeText={onChange}
                  endIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                      {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                    </TouchableOpacity>
                  }
                />
              )}
            />
          </Animated.View>

          {(errorMessage || successMessage) ? (
            <Animated.View style={{ transform: [{ translateY: btnSlideAnim }], opacity: btnFadeAnim }} className="mb-4">
              <Text className={`${errorMessage ? "text-red-500" : "text-green-500"} font-outfit-medium text-left`}>
                {errorMessage || successMessage}
              </Text>
            </Animated.View>
          ) : null}

          <Animated.View style={{ transform: [{ translateY: btnSlideAnim }], opacity: btnFadeAnim }}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleSubmit(onSubmit)} disabled={isResetting}>
              <LinearGradient
                colors={["#6A11CB", "#2575FC"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {isResetting ? <Loader /> : <Text className="font-outfit-bold text-white text-lg">Reset Password</Text>}
              </LinearGradient>
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
