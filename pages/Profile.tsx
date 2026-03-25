import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Toast from 'react-native-toast-message';
import {
  Settings,
  MapPin,
  Pencil,
  Plus,
  Lock,
} from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { updateProfileMutation } from "@services/mutations";
import type { UserProfile, ProfileUpdatePayload } from "@/types/auth";
import { useProfileImageUpload } from "@hooks/useProfileImageUpload";
import { ProgressRing } from "@components/ui/ProgressRing";
// Shared components

import TopGradientFade from "@components/ui/TopGradientFade";
import CollapsibleSection from "@components/ui/CollapsibleSection";
import AvailabilityCalendar from "@components/profile/AvailabilityCalendar";
import SocialIconsRow from "@components/profile/SocialIconsRow";

// Stores
import { useUserStore } from "@store/userStore";

// Demo data fallback
import { MY_PROFILE } from "@constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PORTFOLIO_ITEM_SIZE = Math.floor(SCREEN_WIDTH / 3);


export default function ProfilePage() {
  const router = useRouter();
  const userData = useUserStore((s) => s.userData);
  const setUserData = useUserStore((s) => s.setUserData);
  const profile = userData?.user;

  // Use real profile data if available, fall back to mock
  const user = {
    name: profile?.fullName || MY_PROFILE.name,
    profileImage: profile?.profilePicture || MY_PROFILE.profileImage,
    category: profile?.role || MY_PROFILE.category,
    location: profile?.address || MY_PROFILE.location,
    bio: profile?.specialization ? `${profile.specialization} • ${profile.yearsOfExperience || 0} years experience` : MY_PROFILE.bio,
    contactEmail: profile?.email || MY_PROFILE.contactEmail,
    contactPhone: profile?.mobile || MY_PROFILE.contactPhone,
    socialLinks: {
      instagram: profile?.socialMediaLinks?.instagram || MY_PROFILE.socialLinks?.instagram,
      youtube: profile?.socialMediaLinks?.youtube || MY_PROFILE.socialLinks?.youtube,
      website: profile?.socialMediaLinks?.website || MY_PROFILE.socialLinks?.website,
    },
    availability: MY_PROFILE.availability,
    portfolio: MY_PROFILE.portfolio,
  };

  const [selectedItem, setSelectedItem] = useState<{ uri: string; isPublic: boolean } | null>(null);
  const [profileImage, setProfileImage] = useState(user.profileImage);
  
  const CARD_WIDTH = SCREEN_WIDTH * 0.82;

  const { mutate: updateProfile } = useMutation({
    mutationFn: async (payload: ProfileUpdatePayload) => await updateProfileMutation(payload),
    onSuccess: (_, variables) => {
      if (variables.profilePicture) {
        const updatedProfile: UserProfile = {
          ...(profile || { _id: "" }),
          profilePicture: variables.profilePicture,
        };
        setUserData(updatedProfile, userData?.subscription);
      }
    }
  });

  const {
    localImageUri,
    uploadProgress,
    isUploading,
    handlePickImage,
  } = useProfileImageUpload({
    userId: profile?._id,
    onSuccess: (url) => {
      updateProfile({ profilePicture: url });
    }
  });

  const displayImage = localImageUri || profileImage;

  const handleAddPost = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1], // crops images natively; videos usually ignore this
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      
      // Post-selection validation for videos
      if (asset.type === 'video') {
        const { width, height } = asset;
        if (width && height) {
          const ratio = width / height;
          const is16by9 = Math.abs(ratio - 16/9) < 0.1 || Math.abs(ratio - 9/16) < 0.1;
          const is4by3 = Math.abs(ratio - 4/3) < 0.1 || Math.abs(ratio - 3/4) < 0.1;
          
          if (!is16by9 && !is4by3) {
            Toast.show({
              type: 'error',
              text1: 'Invalid Video Format',
              text2: 'Please upload a 16:9 or 4:3 video.',
            });
            return;
          }
        }
      }

      router.push({
        pathname: "/settings/create-post",
        params: { mediaUri: asset.uri, mediaType: asset.type }
      });
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* ─── Portfolio Image Modal ─── */}
      <Modal
        visible={selectedItem !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSelectedItem(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setSelectedItem(null)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.72)", alignItems: "center", justifyContent: "center" }}
        >
          <TouchableOpacity activeOpacity={1} style={{ width: CARD_WIDTH }}>
            {/* Profile header inside modal card */}
            <View style={{ backgroundColor: "#FFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center" }}>
              <Image source={{ uri: user.profileImage }} style={{ width: 36, height: 36, borderRadius: 18 }} />
              <Text style={{ fontFamily: "Outfit_500Medium", fontSize: 14, color: "#0F172A", marginLeft: 10 }}>
                {user.name.toLowerCase().replace(" ", "_")}
              </Text>
              {selectedItem && !selectedItem.isPublic && (
                <View style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 }}>
                  <Lock size={11} color="#64748B" />
                  <Text style={{ fontFamily: "Outfit_400Regular", fontSize: 10, color: "#64748B" }}>Private</Text>
                </View>
              )}
            </View>
            {/* Full image */}
            {selectedItem && (
              <Image
                source={{ uri: selectedItem.uri }}
                style={{ width: CARD_WIDTH, height: CARD_WIDTH, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Global Top Fade — shared component */}
      <TopGradientFade />

      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          {/* ─── Top Bar ─── */}
          <View className="px-5 py-3 flex-row items-center justify-between">
            <Text className="font-outfit-bold text-lg text-black">My Profile</Text>
            <TouchableOpacity
              onPress={() => router.push("/settings")}
              className="w-11 h-11 items-center justify-center mr-1"
            >
              <Settings size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* ─── Profile Header ─── */}
          <View className="px-5 mt-2 flex-row items-start">
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8} disabled={isUploading} className="relative mr-4 bg-white rounded-full">
              <Image source={{ uri: displayImage }} className="w-24 h-24 rounded-full" />
              {(isUploading || uploadProgress > 0) ? (
                <View className="absolute inset-0 z-10 items-center justify-center pointer-events-none">
                  <ProgressRing progress={uploadProgress} size={96} strokeWidth={3} backgroundColor="transparent" />
                </View>
              ) : (
                <View className="absolute bottom-0 right-0 w-7 h-7 bg-[#0EA5E9] rounded-full items-center justify-center border-2 border-white pointer-events-none">
                  <Pencil size={12} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
            <View className="flex-1 pt-1">
              <View className="flex-row items-center justify-between">
                <Text className="font-outfit-bold text-2xl text-black flex-1" numberOfLines={1}>
                  {user.name}
                </Text>
              </View>
              <Text className="font-outfit-medium text-sm text-slate-500 mt-0.5">
                {user.category.join(" • ")}
              </Text>
              <View className="flex-row items-center mt-1.5 gap-1">
                <MapPin size={13} color="#64748B" />
                <Text className="font-outfit text-sm text-slate-500">{user.location}</Text>
              </View>
            </View>
          </View>

          {/* ─── Bio ─── */}
          <View className="px-5 mt-4">
            <Text className="font-outfit text-sm text-slate-600 leading-relaxed">{user.bio}</Text>
          </View>

          {/* ─── Social & Contact Icons — shared component ─── */}
          <SocialIconsRow
            email={user.contactEmail}
            phone={user.contactPhone}
            instagram={user.socialLinks.instagram}
            youtube={user.socialLinks.youtube}
            website={user.socialLinks.website}
          />

          {/* ─── Availability — shared components ─── */}
          <CollapsibleSection title="Availability" defaultOpen={true}>
            <View className="mb-3 flex-row justify-end px-1">
              <TouchableOpacity onPress={() => router.push("/settings/availability")}>
                <Text className="font-outfit-medium text-xs text-[#0EA5E9]">Edit Schedule</Text>
              </TouchableOpacity>
            </View>
            <AvailabilityCalendar slots={user.availability} />
          </CollapsibleSection>

          {/* ─── Portfolio Grid ─── */}
          <View className="mt-6">
            <View className="flex-row flex-wrap">
              {/* Add tile */}
              <TouchableOpacity
                onPress={handleAddPost}
                activeOpacity={0.7}
                style={{ width: PORTFOLIO_ITEM_SIZE, height: PORTFOLIO_ITEM_SIZE, borderWidth: 0.5, borderColor: "#FFF", backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" }}
              >
                <View className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
                  <Plus size={20} color="#0EA5E9" />
                </View>
                <Text className="font-outfit-medium text-[10px] text-slate-400 mt-2">Add</Text>
              </TouchableOpacity>

              {/* Portfolio items */}
              {user.portfolio.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.85}
                  onPress={() => setSelectedItem(item)}
                  style={{ width: PORTFOLIO_ITEM_SIZE, height: PORTFOLIO_ITEM_SIZE, borderWidth: 0.5, borderColor: "#FFF" }}
                >
                  <Image source={{ uri: item.uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  {!item.isPublic && (
                    <View className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-1">
                      <Lock size={10} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
