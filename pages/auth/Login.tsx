import { View, Text, TouchableOpacity, Animated, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";

import { Input } from "@components/Input";
import AuthCardLayout from "@components/auth/AuthCardLayout";
import GlareShimmer from "@components/auth/GlareShimmer";
import SocialLoginRow from "@components/auth/SocialLoginRow";
import { Loader } from "@components/ui/Loader";
import { useAuthAnimation } from "@hooks/useAuthAnimation";
import { useGoogleAuth } from "@hooks/useGoogleAuth";
import { useAppleAuth } from "@hooks/useAppleAuth";
import { signInMutation, signUpMobileMutation } from "@services/mutations";
import { AuthTabs, AuthMethod } from "@components/auth/AuthTabs";
import { fetchMe } from "@services/queries";
import { useAuthStore } from "@store/authStore";
import { useUserStore } from "@store/userStore";
import type { UserProfile, Subscription, LoginForm } from "@/types/auth";
import { PhoneInput } from "@components/auth/PhoneInput";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");

  const emailForm = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
  });

  const mobileForm = useForm({
    defaultValues: { mobile: "" },
  });

  const { slideAnimRight, slideAnimLeft, fadeAnim, btnSlideAnim, btnFadeAnim, glareAnim } =
    useAuthAnimation();
  const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();
  const { signInWithApple, loading: appleLoading, error: appleError } = useAppleAuth();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUserData = useUserStore((s) => s.setUserData);

  const { mutate: login, isPending: loginPending, error: loginError, reset: resetLoginError } = useMutation({
    mutationFn: signInMutation,
    onSuccess: async (data) => {
      if (!data) throw new Error("Login failed");
      const { authToken, user } = data;

      // Map backend user to UserStore.userData.user format
      const userId = user._id || user.id || "";
      const fullName = user.fullName || "";
      const email = user.email || "";
      const role = user.role || [];
      const profilePicture = user.profilePicture;
      const isProfileCompleted = !!user.isProfileCompleted;

      setAuth({
        id: userId,
        name: fullName,
        email,
        category: role,
        profileImage: profilePicture,
        isProfileCompleted,
      }, authToken);

      // Save to userStore directly from login response
      setUserData({
        _id: userId,
        fullName,
        email,
        role,
        profilePicture,
        isProfileCompleted,
      });

      if (user.isProfileCompleted) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding/role");
      }
    },
  });

  const { mutate: mobileLogin, isPending: mobilePending, error: mobileError, reset: resetMobileError } = useMutation({
    mutationFn: signUpMobileMutation,
    onSuccess: (_, variables) => {
      router.push({
        pathname: "/(auth)/otp",
        params: { type: "mobile", identifier: variables.mobile },
      });
    },
  });

  const handleTabChange = (method: AuthMethod) => {
    setAuthMethod(method);
    resetLoginError();
    resetMobileError();
  };

  const handleLogin = () => {
    if (authMethod === "email") {
      emailForm.handleSubmit((data: LoginForm) => {
        login({ email: data.email, password: data.password });
      })();
    } else {
      mobileForm.handleSubmit((data: { mobile: string }) => {
        mobileLogin({ mobile: "+91" + data.mobile.trim() });
      })();
    }
  };

  const errorMessage = loginError?.message || mobileError?.message || googleError || appleError;
  const isLoading = loginPending || mobilePending || googleLoading || appleLoading;

  return (
    <AuthCardLayout>
      <TouchableOpacity
        className="mt-4 ml-6 self-start p-3 rounded-full bg-white/10 border border-white/20"
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

          <View className="mb-8">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-1.5 h-1.5 bg-gold" />
              <Text className="font-outfit-medium text-text-secondary text-xs tracking-widest uppercase">
                Welcome Back
              </Text>
            </View>
            <Text className="text-4xl font-outfit-bold text-white mb-2">Sign In</Text>
            <Text className="text-base font-outfit text-text-secondary">
              Capture the world. Share your story.
            </Text>
          </View>

          <AuthTabs method={authMethod} onChange={handleTabChange} />

          <Animated.View style={{ transform: [{ translateX: slideAnimRight }], opacity: fadeAnim }} className="gap-4 mb-6">
            <View style={authMethod !== "email" ? styles.hiddenTab : undefined}>
              <View className="gap-4">
                <Controller
                  control={emailForm.control}
                  name="email"
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Email"
                      placeholder="your@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                <Controller
                  control={emailForm.control}
                  name="password"
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Password"
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
              </View>
            </View>
            <View style={authMethod !== "phone" ? styles.hiddenTab : undefined}>
              <PhoneInput control={mobileForm.control} disabled={isLoading} />
            </View>
          </Animated.View>

          <View style={authMethod !== "email" ? styles.hiddenTab : undefined}>
            <Animated.View style={{ transform: [{ translateX: slideAnimRight }], opacity: fadeAnim }}>
              <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")} className="mb-8 mt-2 self-end">
                <Text className="text-right font-outfit text-white/50 text-sm">Forgot password?</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {errorMessage ? (
            <Animated.View style={{ transform: [{ translateY: btnSlideAnim }], opacity: btnFadeAnim }} className="mb-4">
              <Text className="text-red-500 font-outfit-medium text-left">{errorMessage}</Text>
            </Animated.View>
          ) : null}

          <Animated.View style={{ transform: [{ translateY: btnSlideAnim }], opacity: btnFadeAnim }}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleLogin} disabled={isLoading}>
              <View style={[styles.submitBtn, (loginPending || mobilePending) && styles.submitBtnActive]}>
                {(loginPending || mobilePending) ? <Loader /> : <Text className="font-outfit-bold text-white text-lg">Sign In</Text>}
              </View>
            </TouchableOpacity>

            <SocialLoginRow
              onGooglePress={signInWithGoogle}
              onApplePress={signInWithApple}
              disabled={isLoading}
            />
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: btnSlideAnim }], opacity: btnFadeAnim }} className="flex-row items-center justify-center mt-2">
            <Text className="font-outfit text-text-secondary text-base">New to Camaroo? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text className="font-outfit-bold text-white text-base">Create Account</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </AuthCardLayout>
  );
}

const styles = StyleSheet.create({
  hiddenTab: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
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
