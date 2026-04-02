import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, LogOut } from "lucide-react-native";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import TopGradientFade from "@components/ui/TopGradientFade";
import CollapsibleSection from "@components/ui/CollapsibleSection";
import { Input } from "@components/Input";
import { SelectPill } from "@components/SelectPill";
import { SearchablePicker } from "@components/ui/SearchablePicker";
import { Loader } from "@components/ui/Loader";

import { useAuthStore } from "@store/authStore";
import { useUserStore } from "@store/userStore";
import { updateProfileMutation } from "@services/mutations";
import { useLocationPicker } from "@hooks/useLocationPicker";
import { editProfileSchema, EditProfileForm } from "@/validations/profileValidation";
import { CREATOR_ROLES } from "@constants";
import type { SocialMediaLinks, ProfileUpdatePayload, ApiError, UserProfile } from "@/types/auth";
import { useLogout } from "@hooks/useLogout";

const SPEC_OPTIONS = ["Wedding", "Fashion", "Commercial", "Portrait", "Events", "Product"];

export default function EditProfile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingCustomSpec, setIsAddingCustomSpec] = useState(false);
  const [customSpec, setCustomSpec] = useState("");

  const { handleLogout } = useLogout();
  const authUser = useAuthStore(s => s.user);
  const userData = useUserStore(s => s.userData);
  const setUserData = useUserStore(s => s.setUserData);

  const profile = userData?.user;

  // Split address string "city, state, country" into parts safely
  const addressParts = (profile?.address || "").split(",").map((s: string) => s.trim());
  let initCity = "", initState = "", initCountry = "";
  if (addressParts.length >= 3) {
    const [city, state, country] = addressParts;
    initCity = city; initState = state; initCountry = country;
  }

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: profile?.fullName || authUser?.name || "",
      email: profile?.email || authUser?.email || "",
      mobile: (profile?.mobile || authUser?.mobile || "").replace(/^\+91\s*/, ""),
      bio: profile?.specialization || "",
      yearsOfExperience: profile?.yearsOfExperience?.toString() || "",
      country: initCountry || "",
      state: initState || "",
      city: initCity || "",
      categories: (profile?.role as string[]) || [],
      instagram: profile?.socialMediaLinks?.instagram || "",
      youtube: profile?.socialMediaLinks?.youtube || "",
      website: profile?.socialMediaLinks?.website || "",
      other: profile?.socialMediaLinks?.other || "",
    }
  });

  const selectedCountry = watch("country");
  const selectedState = watch("state");
  const selectedCategories = watch("categories") || [];
  const watchedBio = watch("bio") || "";
  const currentSpecs = watchedBio ? watchedBio.split(",").map((s: string) => s.trim()).filter(Boolean) : [];

  const { countryItems, stateItems, cityItems, countriesLoading, statesLoading, citiesLoading } =
    useLocationPicker(selectedCountry || "", selectedState || "");

  const toggleCategory = (cat: string) => {
    if (!isEditing) return;
    const current = [...selectedCategories];
    const index = current.indexOf(cat);
    if (index > -1) current.splice(index, 1);
    else current.push(cat);
    setValue("categories", current);
  };

  const toggleSpecialization = (spec: string) => {
    if (!isEditing) return;
    const current = [...currentSpecs];
    const index = current.indexOf(spec);
    if (index > -1) current.splice(index, 1);
    else current.push(spec);
    setValue("bio", current.join(", "));
  };

  const handleAddCustomSpec = () => {
    const trimmed = customSpec.trim();
    if (trimmed && !currentSpecs.includes(trimmed)) {
      setValue("bio", [...currentSpecs, trimmed].join(", "));
    }
    setCustomSpec("");
    setIsAddingCustomSpec(false);
  };

  const updateMutation = useMutation({
    mutationFn: (data: EditProfileForm) => {
      const addressString = [data.city, data.state, data.country].filter(Boolean).join(", ");
      const finalMobile = data.mobile ? "+91" + data.mobile.trim() : undefined;

      const socialMediaLinks: SocialMediaLinks = {};
      if (data.instagram?.trim()) socialMediaLinks.instagram = data.instagram.trim();
      if (data.youtube?.trim()) socialMediaLinks.youtube = data.youtube.trim();
      if (data.website?.trim()) socialMediaLinks.website = data.website.trim();
      if (data.other?.trim()) socialMediaLinks.other = data.other.trim();

      const payload: ProfileUpdatePayload = {
        fullName: data.fullName,
        email: data.email,
        mobile: finalMobile,
        yearsOfExperience: data.yearsOfExperience ? parseInt(data.yearsOfExperience) : 0,
        ...(data.bio?.trim() ? { specialization: data.bio.trim() } : {}),
        ...(addressString ? { address: addressString } : {}),
        ...(data.state ? { state: data.state } : {}),
        ...(data.city ? { city: data.city } : {}),
        role: data.categories || [],
        ...(Object.keys(socialMediaLinks).length > 0 ? { socialMediaLinks } : {}),
      };

      return updateProfileMutation(payload);
    },
    onSuccess: (_, variables) => {
      const addressString = [variables.city, variables.state, variables.country].filter(Boolean).join(", ");
      const finalMobile = variables.mobile ? "+91" + variables.mobile.trim() : profile?.mobile;
      const updatedProfile: UserProfile = {
        ...(profile || { _id: "" }),
        fullName: variables.fullName,
        email: variables.email,
        mobile: finalMobile,
        specialization: variables.bio,
        yearsOfExperience: variables.yearsOfExperience ? parseInt(variables.yearsOfExperience) : undefined,
        address: addressString,
        role: variables.categories,
        socialMediaLinks: {
          instagram: variables.instagram,
          youtube: variables.youtube,
          website: variables.website,
          other: variables.other,
        },
      };
      setUserData(updatedProfile, userData?.subscription);
      setIsEditing(false);
    },
    onError: (err: ApiError) => {
      Alert.alert("Error", err.message || "Failed to save profile updates.");
    },
  });

  const isSaving = updateMutation.isPending;

  return (
    <View className="flex-1 bg-white">
      <TopGradientFade />
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-5 py-3 flex-row items-center justify-between border-b border-black/5">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 items-center justify-center mr-1" disabled={isSaving}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text className="font-outfit-bold text-xl text-black">Account Details</Text>
          </View>
          {isEditing ? (
            <TouchableOpacity onPress={handleSubmit((d) => updateMutation.mutate(d))} disabled={isSaving}>
              {isSaving ? <Loader color="#0EA5E9" size={8} /> : <Text className="font-outfit-bold text-base text-[#0EA5E9]">Save</Text>}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text className="font-outfit-bold text-base text-[#0EA5E9]">Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <ScrollView className="flex-1 px-5 pt-6 pb-20" showsVerticalScrollIndicator={false}>
            <CollapsibleSection title="Basic Info" defaultOpen={true}>
              <View className="mb-4 pt-2">
                <Text className="font-outfit-medium text-sm text-slate-500 mb-1.5 ml-1">Full Name</Text>
                <Controller name="fullName" control={control} render={({ field: { onChange, value } }) => (
                  <Input variant="light" placeholder="Name" value={value} editable={isEditing} onChangeText={onChange} error={errors.fullName?.message} />
                )} />
              </View>
              <View className="mb-4">
                <Text className="font-outfit-medium text-sm text-slate-500 mb-1.5 ml-1">Email Address</Text>
                <Controller name="email" control={control} render={({ field: { onChange, value } }) => (
                  <Input variant="light" placeholder="hello@example.com" value={value || ""} editable={isEditing && authUser?.signUpType !== "email"} onChangeText={onChange} error={errors.email?.message} keyboardType="email-address" />
                )} />
              </View>
              <View className="mb-4">
                <Text className="font-outfit-medium text-sm text-slate-500 mb-1.5 ml-1">Mobile Number</Text>
                <Controller name="mobile" control={control} render={({ field: { onChange, value } }) => (
                  <Input variant="light" placeholder="000 000 0000" value={value || ""} editable={isEditing && authUser?.signUpType !== "mobile"} onChangeText={onChange} error={errors.mobile?.message} keyboardType="phone-pad" startIcon={<Text className="text-slate-500 font-outfit text-base">+91</Text>} />
                )} />
              </View>
              <View className="mb-4">
                <Text className="font-outfit-medium text-sm text-slate-500 mb-1.5 ml-1">Specialization</Text>
                <View className="flex-row flex-wrap gap-2 px-1">
                  {Array.from(new Set([...SPEC_OPTIONS, ...currentSpecs])).map((spec) => (
                    <TouchableOpacity key={spec} onPress={() => toggleSpecialization(spec)} disabled={!isEditing}
                      className={`border rounded-full px-4 py-2 ${currentSpecs.includes(spec) ? 'bg-[#0EA5E9] border-[#0EA5E9]' : 'bg-slate-50 border-slate-200'}`}>
                      <Text className={`font-outfit text-sm ${currentSpecs.includes(spec) ? 'text-white' : 'text-slate-500'}`}>{spec}</Text>
                    </TouchableOpacity>
                  ))}
                  {isEditing && (isAddingCustomSpec ? (
                    <View className="bg-slate-50 border border-[#0EA5E9] rounded-full px-4 py-2 min-w-[100px] justify-center">
                      <TextInput className="font-outfit text-sm text-black p-0 m-0" placeholder="Type custom..." placeholderTextColor="#94A3B8" value={customSpec} onChangeText={setCustomSpec} onSubmitEditing={handleAddCustomSpec} onBlur={() => setIsAddingCustomSpec(false)} returnKeyType="done" autoFocus style={styles.customSpecInput} />
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setIsAddingCustomSpec(true)} className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 justify-center">
                      <Text className="text-slate-500 font-outfit text-sm">+ Add Custom</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.bio && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.bio.message}</Text>}
              </View>
              <View className="mb-4">
                <Text className="font-outfit-medium text-sm text-slate-500 mb-1.5 ml-1">Years of Experience</Text>
                <Controller name="yearsOfExperience" control={control} render={({ field: { onChange, value } }) => (
                  <Input variant="light" placeholder="e.g. 5" value={value} editable={isEditing} onChangeText={onChange} keyboardType="numeric" error={errors.yearsOfExperience?.message} />
                )} />
              </View>
              <View className="mb-4">
                <SearchablePicker variant="light" label="Country" placeholder="Select Country" items={countryItems} value={selectedCountry || null} onValueChange={(val) => { if (!isEditing) return; setValue("country", val || "", { shouldValidate: true }); setValue("state", "", { shouldValidate: true }); setValue("city", "", { shouldValidate: true }); }} error={errors.country?.message} disabled={!isEditing || countriesLoading} />
              </View>
              <View className="mb-4">
                <SearchablePicker variant="light" label="State" placeholder={selectedCountry ? "Select State" : "Select a country first"} items={stateItems} value={selectedState || null} onValueChange={(val) => { if (!isEditing) return; setValue("state", val || "", { shouldValidate: true }); setValue("city", "", { shouldValidate: true }); }} disabled={!isEditing || !selectedCountry || statesLoading} error={errors.state?.message} />
              </View>
              <View className="mb-4">
                <SearchablePicker variant="light" label="City" placeholder={selectedState ? "Select City" : "Select a state first"} items={cityItems} value={watch("city") || null} onValueChange={(val) => { if (!isEditing) return; setValue("city", val || "", { shouldValidate: true }); }} disabled={!isEditing || !selectedState || citiesLoading} error={errors.city?.message} />
              </View>
            </CollapsibleSection>

            <CollapsibleSection title="Your Roles" defaultOpen={false}>
              <View className="flex-row flex-wrap gap-2 mb-2 pt-2">
                {CREATOR_ROLES.map((role) => (
                  <View key={role} style={styles.halfWidth}>
                    <SelectPill label={role} selected={selectedCategories.includes(role)} onPress={() => toggleCategory(role)} variant="light" />
                  </View>
                ))}
              </View>
              {errors.categories && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.categories.message}</Text>}
            </CollapsibleSection>

            <CollapsibleSection title="Social Links" defaultOpen={false}>
              <View className="mb-4 pt-2">
                <Text className="font-outfit-medium text-sm text-slate-500 mb-1.5 ml-1">Instagram URL</Text>
                <Controller name="instagram" control={control} render={({ field: { onChange, value } }) => (
                  <Input variant="light" placeholder="https://instagram.com/..." value={value} editable={isEditing} onChangeText={onChange} error={errors.instagram?.message} />
                )} />
              </View>
              <View className="mb-4">
                <Text className="font-outfit-medium text-sm text-slate-500 mb-1.5 ml-1">YouTube URL</Text>
                <Controller name="youtube" control={control} render={({ field: { onChange, value } }) => (
                  <Input variant="light" placeholder="https://youtube.com/..." value={value} editable={isEditing} onChangeText={onChange} error={errors.youtube?.message} />
                )} />
              </View>
              <View className="mb-4">
                <Text className="font-outfit-medium text-sm text-slate-500 mb-1.5 ml-1">Website URL</Text>
                <Controller name="website" control={control} render={({ field: { onChange, value } }) => (
                  <Input variant="light" placeholder="https://..." value={value} editable={isEditing} onChangeText={onChange} error={errors.website?.message} />
                )} />
              </View>
            </CollapsibleSection>

            <View className="mt-8 mb-4 border-t border-slate-200/60 pt-8" />
            <TouchableOpacity activeOpacity={0.8} onPress={() => Alert.alert("Logout", "Are you sure you want to log out?", [{ text: "Cancel", style: "cancel" }, { text: "Logout", style: "destructive", onPress: handleLogout }])} className="flex-row items-center justify-center py-4 rounded-xl bg-red-50 border border-red-100 mb-10">
              <LogOut size={18} color="#EF4444" className="mr-2" />
              <Text className="font-outfit-bold text-red-500 text-base mt-0.5">Log Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  customSpecInput: {
    height: 20,
    minHeight: 20,
  },
  halfWidth: {
    width: '48%',
  },
});
