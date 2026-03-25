import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { ArrowLeft } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";

import { Input } from "@components/Input";
import AuthCardLayout from "@components/auth/AuthCardLayout";
import GlareShimmer from "@components/auth/GlareShimmer";
import { Loader } from "@components/ui/Loader";
import { useAuthAnimation } from "@hooks/useAuthAnimation";
import { verifyOtpMutation } from "@services/mutations";
import { useAuthStore } from "@store/authStore";
import { useUserStore } from "@store/userStore";
import type { OtpForm } from "@/types/auth";

export default function OtpVerifyScreen() {
  const router = useRouter();
  const { type, identifier } = useLocalSearchParams<{ type: "email" | "mobile"; identifier: string }>();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUserData = useUserStore((s) => s.setUserData);

  const { control, handleSubmit } = useForm<OtpForm>({
    defaultValues: { otp: "" },
  });

  const { slideAnimRight, fadeAnim, btnSlideAnim, btnFadeAnim, glareAnim } =
    useAuthAnimation();

  const { mutate: verifyOtp, isPending, error } = useMutation({
    mutationFn: verifyOtpMutation,
    onSuccess: (data) => {
      if (!data) return;
      const { authToken, user, signUpType: responseSignUpType } = data;

      const resolvedSignUpType = (responseSignUpType || user.signUpType || (type === "email" ? "email" : "mobile")) as string;

      const userId = user._id || user.id || "";
      const fullName = user.fullName || "";
      const email = user.email || (type === "email" ? String(identifier || "") : "");
      const mobile = user.mobile || (type === "mobile" ? String(identifier || "") : "");
      const role = user.role || [];
      const profilePicture = user.profilePicture;
      const isProfileCompleted = !!user.isProfileCompleted;

      setAuth({
        id: userId,
        name: fullName,
        email,
        mobile,
        signUpType: resolvedSignUpType,
        category: role,
        profileImage: profilePicture,
        isProfileCompleted,
      }, authToken);

      setUserData({
        _id: userId,
        fullName,
        email,
        mobile,
        signUpType: resolvedSignUpType,
        role,
        profilePicture,
        isProfileCompleted,
      });

      // Use isProfileCompleted to route existing users to tabs, and new users to onboarding
      if (user.isProfileCompleted) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding/role");
      }
    },
  });

  const onSubmit = (data: OtpForm) => {
    if (data.otp.length < 6) return;
    verifyOtp({ type: type as "email" | "mobile", otp: data.otp, [type as string]: identifier });
  };

  return (
    <AuthCardLayout>
      <TouchableOpacity
        className="mt-4 ml-6 self-start p-3 rounded-full bg-white/10 border border-white/20"
        onPress={() => router.back()}
      >
        <ArrowLeft size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <View className="flex-1 justify-center px-6 pb-10">
        <View className="p-8 rounded-2xl border border-white/20 bg-white/5 shadow-2xl relative overflow-hidden">
          <GlareShimmer glareAnim={glareAnim} />

          <View className="mb-8">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-1.5 h-1.5 bg-gold" />
              <Text className="font-outfit-medium text-text-secondary text-xs tracking-widest uppercase">
                Verification Required
              </Text>
            </View>
            <Text className="text-4xl font-outfit-bold text-white mb-2">Check your {type}</Text>
            <Text className="text-base font-outfit text-text-secondary">
              We sent a 6-digit code to {identifier}.
            </Text>
          </View>

          <View className="mb-6">
            <Animated.View style={{ transform: [{ translateX: slideAnimRight }], opacity: fadeAnim }}>
              <Controller
                control={control}
                name="otp"
                rules={{ required: true, minLength: 6 }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="6-Digit OTP"
                    placeholder="123456"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </Animated.View>
          </View>

          {error ? (
            <Animated.View style={{ transform: [{ translateY: btnSlideAnim }], opacity: btnFadeAnim }} className="mb-4">
              <Text className="text-red-500 font-outfit-medium text-left">{error.message}</Text>
            </Animated.View>
          ) : null}

          <Animated.View style={{ transform: [{ translateY: btnSlideAnim }], opacity: btnFadeAnim }}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleSubmit(onSubmit)} disabled={isPending}>
              <View style={[styles.submitBtn, isPending && styles.submitBtnActive]}>
                {isPending ? <Loader /> : <Text className="font-outfit-bold text-white text-lg">Verify & Continue</Text>}
              </View>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={() => {/* Handle resend logic */}}>
            <Text className="text-center font-outfit text-secondary text-sm">Didn't receive code? Resend</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthCardLayout>
  );
}

const styles = StyleSheet.create({
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#6A11CB",
  },
  submitBtnActive: {
    backgroundColor: "#4A00A0",
  },
});
