import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@store/authStore";
import { useUserStore } from "@store/userStore";
import { updateProfileMutation } from "@services/mutations";
import { Loader } from "@components/ui/Loader";
import type { ProfileUpdatePayload, ApiError, OptionalForm } from "@/types/auth";

export default function OnboardingOptional() {
  const router = useRouter();
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customSpec, setCustomSpec] = useState("");

  const onboardingData = useAuthStore(s => s.onboardingData);
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);
  const clearOnboardingData = useAuthStore(s => s.clearOnboardingData);
  const userData = useUserStore(s => s.userData);
  const setUserData = useUserStore(s => s.setUserData);

  const { control, handleSubmit } = useForm<OptionalForm>({
    defaultValues: { experience: "" }
  });

  const toggleSpecialization = (spec: string) => {
    setSpecializations(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const handleAddCustomSpec = () => {
    const trimmed = customSpec.trim();
    if (trimmed && !specializations.includes(trimmed)) {
      setSpecializations(prev => [...prev, trimmed]);
    }
    setCustomSpec("");
    setIsAddingCustom(false);
  };

  const { mutate: finishProfile, isPending } = useMutation({
    mutationFn: async (data: OptionalForm) => {
      const signUpType = user?.signUpType || "email";

      const payload: ProfileUpdatePayload = {
        fullName: onboardingData.fullName || "",
        role: onboardingData.role || [],
        category: "single",
        signUpType,
        profilePicture: onboardingData.profilePicture || user?.profileImage || "",
        address: onboardingData.address || "",
        state: onboardingData.state || "",
        city: onboardingData.city || "",
        location: { type: "Point", coordinates: [0, 0] },
        ...(onboardingData.socialMediaLinks && Object.keys(onboardingData.socialMediaLinks).length > 0
          ? { socialMediaLinks: onboardingData.socialMediaLinks }
          : {}),
        ...(signUpType === "mobile" && onboardingData.email
          ? { email: onboardingData.email }
          : onboardingData.mobile
            ? { mobile: onboardingData.mobile }
            : {}),
      };

      const experience = parseInt(data.experience, 10);
      if (!isNaN(experience)) {
        payload.yearsOfExperience = experience;
      }

      const combinedSpec = specializations.join(", ").trim();
      if (combinedSpec) {
        payload.specialization = combinedSpec;
      }

      const response = await updateProfileMutation(payload);
      return response;
    },
    onSuccess: () => {
      updateUser({ isProfileCompleted: true });

      if (userData?.user) {
        setUserData({
          ...userData.user,
          isProfileCompleted: true,
        }, userData.subscription);
      }

      clearOnboardingData();
      router.replace("/(tabs)");
    },
    onError: (err: ApiError) => {
      console.log("Failed to complete profile:", err.message);
      setApiError(err.message || "An unexpected error occurred. Please try again.");
    }
  });

  const onSubmit = (data: OptionalForm) => {
    finishProfile(data);
  };

  const specOptions = ["Wedding", "Fashion", "Commercial", "Portrait", "Events", "Product"];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <LinearGradient
        colors={["#5b8fbc", "#1A2b4c", "#060D1A"]}
        locations={[0, 0.4, 1]}
        style={styles.fullOverlay}
      />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center border-b border-white/5 justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity disabled={isPending} onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-white/10 mr-4">
              <ArrowLeft size={20} color="#FFF" />
            </TouchableOpacity>
            <Text className="font-outfit-bold text-white text-xl">Final Step</Text>
          </View>
          <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={isPending}>
            <Text className="font-outfit-medium text-white/50 text-base">Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 pt-8">
          <Text className="text-3xl font-outfit-bold text-white mb-2">Optional Info</Text>
          <Text className="text-base font-outfit text-text-secondary mb-10">
            Tell us about your professional background to help clients find you faster. (You can skip this for now).
          </Text>

          <View className="gap-6">
            <View>
              <Text className="text-xs font-outfit-medium text-text-secondary mb-2 ml-1 tracking-wider uppercase">Years of Experience</Text>
              <View className="flex-row items-center bg-white/10 border border-white/15 rounded-xl px-2 py-1">
                <Controller name="experience" control={control} render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="flex-1 px-3 py-3 font-outfit text-white text-base"
                    placeholder="e.g. 5"
                    keyboardType="numeric"
                    placeholderTextColor="rgba(148,163,184,0.6)"
                    value={value}
                    onChangeText={onChange}
                    editable={!isPending}
                  />
                )} />
                <Text className="text-white/40 font-outfit mr-3">Years</Text>
              </View>
            </View>

            <View>
              <Text className="text-xs font-outfit-medium text-text-secondary mb-3 ml-1 tracking-wider uppercase">Specialization</Text>

              <View className="flex-row flex-wrap gap-2">
                {Array.from(new Set([...specOptions, ...specializations])).map((spec) => (
                  <TouchableOpacity
                    key={spec}
                    onPress={() => toggleSpecialization(spec)}
                    disabled={isPending}
                    className={`border rounded-full px-4 py-2 ${specializations.includes(spec) ? 'bg-[#2575FC] border-[#2575FC]' : 'bg-white/5 border-white/10'}`}
                  >
                    <Text className={`font-outfit text-sm ${specializations.includes(spec) ? 'text-white' : 'text-white/80'}`}>
                      {spec}
                    </Text>
                  </TouchableOpacity>
                ))}

                {isAddingCustom ? (
                  <TextInput
                    autoFocus
                    className="bg-white/10 border border-[#2575FC] rounded-full px-4 py-2 font-outfit text-white text-sm min-w-[100px]"
                    placeholder="Type custom..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={customSpec}
                    onChangeText={setCustomSpec}
                    onSubmitEditing={handleAddCustomSpec}
                    onBlur={() => setIsAddingCustom(false)}
                    returnKeyType="done"
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => setIsAddingCustom(true)}
                    disabled={isPending}
                    className="bg-white/10 border border-white/20 rounded-full px-4 py-2"
                  >
                    <Text className="text-white font-outfit text-sm">+ Add Custom</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

        </ScrollView>

        {/* Bottom Bar */}
        <View className="p-6 pt-4 border-t border-white/5 bg-[#060D1A]/80">
          {apiError && (
            <Text className="text-red-500 font-outfit-medium text-left mb-3">{apiError}</Text>
          )}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
          >
            <LinearGradient
              colors={["#6A11CB", "#2575FC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {isPending ? (
                <Loader />
              ) : (
                <Text className="font-outfit-bold text-white text-lg">Complete Profile</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fullOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  submitGradient: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
});
