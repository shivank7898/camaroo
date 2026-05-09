import { View, Text, TouchableOpacity, TextInput, Image, Platform, StyleSheet, Keyboard, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Camera, Instagram, Youtube, Globe, Link2 } from "lucide-react-native";
import { Input } from "@components/Input";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@store/authStore";
import { useMutation } from "@tanstack/react-query";
import { updateProfileMutation } from "@services/mutations";
import { getOnboardingDetailsSchema, OnboardingDetailsForm } from "@/validations/profileValidation";
import { useProfileImageUpload } from "@hooks/useProfileImageUpload";
import type { SocialMediaLinks, ProfileUpdatePayload, ApiError, PickedLocation } from "@/types/auth";

import { ProgressRing } from "@components/ui/ProgressRing";
import { Loader } from "@components/ui/Loader";
import { LocationAutocomplete } from "@components/ui/LocationAutocomplete";

export default function OnboardingDetails() {
  const router = useRouter();
  const setOnboardingData = useAuthStore((s) => s.setOnboardingData);
  const user = useAuthStore((s) => s.user);
  const onboardingData = useAuthStore((s) => s.onboardingData);

  const isMobileSignup = user?.signUpType === "mobile";
  const detailsSchema = getOnboardingDetailsSchema(isMobileSignup);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<OnboardingDetailsForm>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      fullName: onboardingData?.fullName || "",
      email: isMobileSignup ? "" : user?.email || "",
      mobile: !isMobileSignup ? "" : (user?.mobile?.replace(/^\+91\s*/, "") || ""),
      country: "India",
      state: "",
      city: "",
      instagram: "",
      youtube: "",
      website: "",
      other: "",
    } as OnboardingDetailsForm
  });

  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(null);

  const {
    localImageUri,
    uploadedUrl,
    uploadProgress,
    imageError,
    setImageError,
    isUploading,
    handlePickImage,
  } = useProfileImageUpload({ userId: user?.id });

  const [apiError, setApiError] = useState<string | null>(null);

  const buildSocialLinks = (raw: Pick<OnboardingDetailsForm, 'instagram' | 'youtube' | 'website' | 'other'>): SocialMediaLinks =>
    Object.fromEntries(
      Object.entries({ instagram: raw.instagram, youtube: raw.youtube, website: raw.website, other: raw.other })
        .filter(([, v]) => v?.trim())
        .map(([k, v]) => [k, v!.trim()])
    );

  const { mutate: patchMandatory, isPending: patchPending } = useMutation({
    mutationFn: async (data: OnboardingDetailsForm) => {
      const signUpType = user?.signUpType || "email";
      const socialMediaLinks = buildSocialLinks(data);

      const payload: ProfileUpdatePayload = {
        fullName: data.fullName,
        role: onboardingData.role || [],
        category: "single",
        signUpType,
        profilePicture: uploadedUrl || user?.profileImage || "",
        location: { 
          type: "Point", 
          place: pickedLocation?.place || "",
          coordinates: pickedLocation ? [pickedLocation.lng, pickedLocation.lat] : [0, 0] 
        },
        ...(Object.keys(socialMediaLinks).length > 0 ? { socialMediaLinks } : {}),
        ...(signUpType === "mobile"
          ? { email: data.email }
          : { mobile: "+91" + (data.mobile || "").trim() }),
      };

      return await updateProfileMutation(payload);
    },
    onSuccess: (_res, variables) => {
      const socialMediaLinks = buildSocialLinks(variables);

      setOnboardingData({
        fullName: variables.fullName,
        email: variables.email,
        mobile: variables.mobile,
        pickedLocation: pickedLocation || undefined,
        profilePicture: uploadedUrl || user?.profileImage || undefined,
        socialMediaLinks,
      });
      router.push("/onboarding/optional");
    },
    onError: (err: ApiError) => {
      console.log("Failed to update mandatory profile fields", err.message);
      setApiError(err.message || "An unexpected error occurred. Please try again.");
    }
  });

  const onSubmit = (data: OnboardingDetailsForm) => {
    setApiError(null);
    setImageError(null);
    if (!localImageUri && !user?.profileImage) {
      setImageError("Profile image is required.");
      return;
    }
    if (!pickedLocation) {
      setApiError("Location is required.");
      return;
    }
    patchMandatory(data);
  };

  const isHandlingRequests = isUploading || patchPending;

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#5b8fbc", "#1A2b4c", "#060D1A"]}
        locations={[0, 0.4, 1]}
        style={styles.fullOverlay}
      />
      <SafeAreaView className="flex-1">
        <View className="px-6 py-4 flex-row items-center border-b border-white/5">
          <TouchableOpacity onPress={() => router.back()} disabled={isHandlingRequests} className="w-10 h-10 items-center justify-center rounded-full bg-white/10 mr-4">
            <ArrowLeft size={20} color="#FFF" />
          </TouchableOpacity>
          <Text className="font-outfit-bold text-white text-xl">Step 2 of 3</Text>
        </View>

        <KeyboardAwareScrollView
          className="flex-1 px-6 pt-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraHeight={150}
          extraScrollHeight={50}
        >
          <Text className="text-3xl font-outfit-bold text-white mb-2">Almost there</Text>
          <Text className="text-base font-outfit text-text-secondary mb-8">
            Tell us more about yourself to complete your creative profile.
          </Text>

          <View className="items-center mb-8 relative">
            <TouchableOpacity
              className={`w-24 h-24 rounded-full bg-white/10 border-2 items-center justify-center overflow-hidden ${imageError ? 'border-red-500' : 'border-dashed border-white/30'
                }`}
              onPress={handlePickImage}
              disabled={isHandlingRequests}
            >
              {isUploading && (
                <View className="absolute inset-0 z-10 items-center justify-center pointer-events-none bg-black/50">
                  <ActivityIndicator size="large" color="#0EA5E9" />
                </View>
              )}
              {localImageUri ? (
                <Image source={{ uri: localImageUri }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Camera size={28} color="rgba(255,255,255,0.7)" />
              )}
            </TouchableOpacity>

            {imageError && (
              <Text className="text-red-500 text-xs font-outfit mt-4 text-center">{imageError}</Text>
            )}
          </View>

          <View className="gap-5">
            <Controller name="fullName" control={control} render={({ field: { onChange, value } }) => (
              <Input label="Full Name *" placeholder="e.g. Jenny Wilson" value={value || ""} onChangeText={onChange} error={errors.fullName?.message as string} />
            )} />

            {isMobileSignup ? (
              <Controller name="email" control={control} render={({ field: { onChange, value } }) => (
                <Input label="Email Address *" placeholder="hello@example.com" keyboardType="email-address" autoCapitalize="none" value={value || ""} onChangeText={onChange} error={errors.email?.message as string} />
              )} />
            ) : (
              <Controller name="mobile" control={control} render={({ field: { onChange, value } }) => (
                <Input label="Mobile Number *" placeholder="000 000 0000" keyboardType="phone-pad" value={value || ""} onChangeText={onChange} error={errors.mobile?.message as string} startIcon={<Text className="text-white/60 font-outfit text-base">+91</Text>} />
              )} />
            )}

            <LocationAutocomplete 
              label="Location *"
              value={pickedLocation}
              onSelect={setPickedLocation}
              onClear={() => setPickedLocation(null)}
              variant="dark"
              disabled={isHandlingRequests}
            />

            <View className="mt-4">
              <Text className="text-xs font-outfit-medium text-white mb-4 ml-1 tracking-wider uppercase">Social Links</Text>
              <View className="gap-3">
                <Controller name="instagram" control={control} render={({ field: { onChange, value } }) => (
                  <View className="mb-1">
                    <View className={`flex-row items-center bg-white/10 border ${errors.instagram ? 'border-red-500' : 'border-white/15'} rounded-xl px-4 py-1`}>
                      <Instagram size={20} color="#E1306C" />
                      <TextInput className="flex-1 ml-3 py-3 font-outfit text-white text-base" placeholder="Instagram username" placeholderTextColor="rgba(148,163,184,0.6)" value={value || ""} onChangeText={onChange} editable={!isHandlingRequests} />
                    </View>
                    {errors.instagram && <Text className="text-red-500 text-xs font-outfit mt-1 ml-1">{errors.instagram.message as string}</Text>}
                  </View>
                )} />
                <Controller name="youtube" control={control} render={({ field: { onChange, value } }) => (
                  <View className="mb-1">
                    <View className={`flex-row items-center bg-white/10 border ${errors.youtube ? 'border-red-500' : 'border-white/15'} rounded-xl px-4 py-1`}>
                      <Youtube size={20} color="#FF0000" />
                      <TextInput className="flex-1 ml-3 py-3 font-outfit text-white text-base" placeholder="YouTube channel URL" placeholderTextColor="rgba(148,163,184,0.6)" value={value || ""} onChangeText={onChange} editable={!isHandlingRequests} />
                    </View>
                    {errors.youtube && <Text className="text-red-500 text-xs font-outfit mt-1 ml-1">{errors.youtube.message as string}</Text>}
                  </View>
                )} />
                <Controller name="website" control={control} render={({ field: { onChange, value } }) => (
                  <View className="mb-1">
                    <View className={`flex-row items-center bg-white/10 border ${errors.website ? 'border-red-500' : 'border-white/15'} rounded-xl px-4 py-1`}>
                      <Globe size={20} color="#3B82F6" />
                      <TextInput className="flex-1 ml-3 py-3 font-outfit text-white text-base" placeholder="Personal website URL" placeholderTextColor="rgba(148,163,184,0.6)" value={value || ""} onChangeText={onChange} editable={!isHandlingRequests} />
                    </View>
                    {errors.website && <Text className="text-red-500 text-xs font-outfit mt-1 ml-1">{errors.website.message as string}</Text>}
                  </View>
                )} />
                <Controller name="other" control={control} render={({ field: { onChange, value } }) => (
                  <View className="mb-1">
                    <View className={`flex-row items-center bg-white/10 border ${errors.other ? 'border-red-500' : 'border-white/15'} rounded-xl px-4 py-1`}>
                      <Link2 size={20} color="#94A3B8" />
                      <TextInput className="flex-1 ml-3 py-3 font-outfit text-white text-base" placeholder="Other portfolio link" placeholderTextColor="rgba(148,163,184,0.6)" value={value || ""} onChangeText={onChange} editable={!isHandlingRequests} />
                    </View>
                    {errors.other && <Text className="text-red-500 text-xs font-outfit mt-1 ml-1">{errors.other.message as string}</Text>}
                  </View>
                )} />
              </View>
            </View>
          </View>
          </KeyboardAwareScrollView>

        {/* Footer */}
        <View className="px-6 pb-6 pt-2 border-t border-white/5 bg-[#060D1A]">
          {apiError && (
            <Text className="text-red-500 font-outfit-medium text-left mb-3">{apiError}</Text>
          )}
          <TouchableOpacity activeOpacity={0.85} onPress={handleSubmit(onSubmit)} disabled={isHandlingRequests || isUploading} style={{ opacity: isHandlingRequests || isUploading ? 0.5 : 1 }}>
            <LinearGradient colors={["#6A11CB", "#2575FC"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGradient}>
              {patchPending ? <Loader /> : <Text className="font-outfit-bold text-white text-lg">Continue</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
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
