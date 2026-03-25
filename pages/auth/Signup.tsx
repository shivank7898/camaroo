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
import { AuthTabs, AuthMethod } from "@components/auth/AuthTabs";
import { useAuthAnimation } from "@hooks/useAuthAnimation";
import { useGoogleAuth } from "@hooks/useGoogleAuth";
import { useAppleAuth } from "@hooks/useAppleAuth";
import { signUpEmailMutation, signUpMobileMutation } from "@services/mutations";
import type { EmailSignupForm, PhoneSignupForm } from "@/types/auth";
import { PhoneInput } from "@components/auth/PhoneInput";

export default function SignupScreen() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [showPassword, setShowPassword] = useState(false);

  const emailForm = useForm<EmailSignupForm>({ defaultValues: { email: "", password: "" } });
  const phoneForm = useForm<PhoneSignupForm>({ defaultValues: { mobile: "" } });

  const { slideAnimLeft, fadeAnim, btnSlideAnim, btnFadeAnim, glareAnim } =
    useAuthAnimation();
  const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();
  const { signInWithApple, loading: appleLoading, error: appleError } = useAppleAuth();

  const { mutate: signUpEmail, isPending: emailPending, error: emailError, reset: resetEmailError } = useMutation({
    mutationFn: signUpEmailMutation,
    onSuccess: () => {
      router.push({
        pathname: "/(auth)/otp",
        params: { type: "email", identifier: emailForm.getValues("email") },
      });
    },
  });

  const { mutate: signUpMobile, isPending: mobilePending, error: mobileError, reset: resetMobileError } = useMutation({
    mutationFn: signUpMobileMutation,
    onSuccess: () => {
      router.push({
        pathname: "/(auth)/otp",
        params: { type: "mobile", identifier: "+91" + phoneForm.getValues("mobile") },
      });
    },
  });

  const handleTabChange = (method: AuthMethod) => {
    setAuthMethod(method);
    resetEmailError();
    resetMobileError();
  };

  const handleSignup = () => {
    if (authMethod === "email") {
      emailForm.handleSubmit((data) => signUpEmail({ email: data.email, password: data.password }))();
    } else {
      phoneForm.handleSubmit((data) => signUpMobile({ mobile: "+91" + data.mobile.trim() }))();
    }
  };

  const signupLoading = emailPending || mobilePending;
  const errorMessage = emailError?.message || mobileError?.message || googleError || appleError;
  const isLoading = signupLoading || googleLoading || appleLoading;

  return (
    <AuthCardLayout>
      <TouchableOpacity
        className="mt-4 ml-6 self-start p-3 rounded-full bg-white/10 border border-white/20"
        onPress={() => router.back()}
        style={styles.backBtn}
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
                Join the Community
              </Text>
            </View>
            <Text className="text-4xl font-outfit-bold text-white mb-2">Create Account</Text>
            <Text className="text-base font-outfit text-text-secondary">
              Start sharing your lens with the world.
            </Text>
          </View>

          <AuthTabs method={authMethod} onChange={handleTabChange} />

          <Animated.View style={{ transform: [{ translateX: slideAnimLeft }], opacity: fadeAnim }} className="gap-4 mb-6">
            <View style={authMethod !== "email" ? styles.hiddenTab : undefined}>
              <Controller
                control={emailForm.control}
                name="email"
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Email Address"
                    placeholder="hello@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={value || ""}
                    onChangeText={onChange}
                  />
                )}
              />
              <View className="mt-4">
                <Controller
                  control={emailForm.control}
                  name="password"
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Password"
                      placeholder="••••••••"
                      secureTextEntry={!showPassword}
                      value={value || ""}
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
              <PhoneInput control={phoneForm.control} disabled={isLoading} />
            </View>
          </Animated.View>

          {errorMessage ? (
            <Animated.View style={{ transform: [{ translateY: btnSlideAnim }], opacity: btnFadeAnim }} className="mb-4">
              <Text className="text-red-500 font-outfit-medium text-left">{errorMessage}</Text>
            </Animated.View>
          ) : null}

          <Animated.View style={{ transform: [{ translateY: btnSlideAnim }], opacity: btnFadeAnim }}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleSignup} disabled={isLoading}>
              <View style={[styles.submitBtn, signupLoading && styles.submitBtnActive]}>
                {signupLoading ? <Loader /> : <Text className="font-outfit-bold text-white text-lg">Continue</Text>}
              </View>
            </TouchableOpacity>

            <SocialLoginRow
              onGooglePress={signInWithGoogle}
              onApplePress={signInWithApple}
              disabled={isLoading}
            />
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: btnSlideAnim }], opacity: btnFadeAnim }} className="flex-row items-center justify-center mt-2">
            <Text className="font-outfit text-text-secondary text-base">Already shooting with us? </Text>
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
  backBtn: {
    zIndex: 20,
  },
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
