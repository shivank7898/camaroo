import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Share,
  Alert,
  StyleSheet,
  Animated,
  ActivityIndicator
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Settings,
  MapPin,
  Pencil,
  Plus,
  Lock,
  Heart,
  Share2,
  MoreHorizontal,
  ChevronRight,
  Users
} from "lucide-react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateProfileMutation, likePortfolioPostMutation, unlikePortfolioPostMutation, updatePortfolioMutation } from "@services/mutations";
import { getUserPortfolioQuery, getCalendarQuery } from "@services/queries";
import type { PortfolioPost } from "@/types/portfolio";
import { useVideoPlayer, VideoView } from "expo-video";
import type { UserProfile, ProfileUpdatePayload } from "@/types/auth";
import { useProfileImageUpload } from "@hooks/useProfileImageUpload";
import { ProgressRing } from "@components/ui/ProgressRing";
import DefaultProfilePicture from "@/components/ui/DefaultProfilePicture";
// Shared components

import TopGradientFade from "@components/ui/TopGradientFade";
import CollapsibleSection from "@components/ui/CollapsibleSection";
import AvailabilityCalendar from "@components/profile/AvailabilityCalendar";
import { ProfileTabBar, type ProfileTabSpec } from "@/components/profile/ProfileTabBar";
import { useOpportunities } from "@/hooks/useOpportunities";
import { OpportunityCard } from "@/components/opportunity/OpportunityCard";

// Stores
import { useUserStore } from "@store/userStore";


const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PORTFOLIO_ITEM_SIZE = Math.floor(SCREEN_WIDTH / 3);

function ModalVideoPlayer({ uri }: { uri: string }) {
  const [hasPlayed, setHasPlayed] = useState(false);
  const player = useVideoPlayer(uri, player => {
    player.loop = true;
    player.play();
  });

  React.useEffect(() => {
    let interval = setInterval(() => {
      if (player.playing || player.currentTime > 0) {
        setHasPlayed(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [player]);

  // Cleanup: release player on unmount to prevent OOM
  React.useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch (_) {}
    };
  }, [player]);

  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const [showPlay, setShowPlay] = useState(false);

  const flashFeedback = (isPlaying: boolean) => {
    setShowPlay(!isPlaying);
    feedbackOpacity.setValue(0.7);
    Animated.timing(feedbackOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    const wasPlaying = player.playing;
    if (wasPlaying) player.pause();
    else player.play();
    flashFeedback(wasPlaying);
  };

  const seekForward = () => {
    player.currentTime += 5;
  };

  const seekBackward = () => {
    player.currentTime = Math.max(0, player.currentTime - 5);
  };

  return (
    <View className="w-full relative h-[350px] bg-[#0F172A]">
      <VideoView
        player={player}
        style={{ flex: 1 }}
        contentFit="contain"
        nativeControls={false}
      />
      {!hasPlayed && (
        <View className="absolute inset-0 items-center justify-center bg-[#0F172A] z-10 w-full h-full" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
           <ActivityIndicator size="large" color="#94A3B8" />
        </View>
      )}
      <View style={{ ...StyleSheet.absoluteFillObject, flexDirection: "row" }} collapsable={false}>
        <TouchableOpacity activeOpacity={1} onPress={handlePress} onLongPress={seekBackward} delayLongPress={500} style={{ flex: 1 }} />
        <TouchableOpacity activeOpacity={1} onPress={handlePress} onLongPress={seekForward} delayLongPress={500} style={{ flex: 1 }} />
      </View>
      {/* Play/Pause visual feedback */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { alignItems: "center", justifyContent: "center", opacity: feedbackOpacity }]}
      >
        <View className="w-16 h-16 rounded-full bg-black/60 items-center justify-center">
          <Text className="text-white text-2xl font-outfit-bold">{showPlay ? "▶" : "❚❚"}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userData = useUserStore((s) => s.userData);
  const setUserData = useUserStore((s) => s.setUserData);
  const profile = userData?.user;

  console.log("[Profile Page] Target Profile Pic URL:", profile?.profilePicture);

  // Use real profile data — show empty/defaults if not available
  const user = {
    name: profile?.fullName || "",
    profileImage: profile?.profilePicture || "",
    category: profile?.role || [],
    location: profile?.address || "",
    subscriberCount: profile?.subscriberCount || 0,
    bio: profile?.specialization ? `${profile.specialization} • ${profile.yearsOfExperience || 0} years experience` : "",
    contactEmail: profile?.email || "",
    contactPhone: profile?.mobile || "",
    socialLinks: {
      instagram: profile?.socialMediaLinks?.instagram || "",
      youtube: profile?.socialMediaLinks?.youtube || "",
      website: profile?.socialMediaLinks?.website || "",
    },
  };

  const { data: portfolioResponse, isLoading: isPortfolioLoading } = useQuery({
    queryKey: ["my-portfolio"],
    queryFn: () => getUserPortfolioQuery({ isOwner: true }),
  });

  let portfolioItems: PortfolioPost[] = [];
  if (Array.isArray(portfolioResponse)) {
    portfolioItems = portfolioResponse;
  } else if (portfolioResponse?.data && Array.isArray(portfolioResponse.data)) {
    portfolioItems = portfolioResponse.data;
  }

  const [selectedItem, setSelectedItem] = useState<PortfolioPost | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileImage, setProfileImage] = useState(user.profileImage);
  const [activeTab, setActiveTab] = useState<ProfileTabSpec>("portfolio");
  const tabScrollRef = useRef<ScrollView>(null);
  const { tab } = useLocalSearchParams<{ tab: string }>();

  React.useEffect(() => {
    if (tab === "opportunities") {
      setActiveTab("opportunities");
      setTimeout(() => {
        tabScrollRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: false });
      }, 0);
    }
  }, [tab]);

  const handleTabChange = useCallback((newTab: ProfileTabSpec) => {
    setActiveTab(newTab);
    tabScrollRef.current?.scrollTo({ x: newTab === "portfolio" ? 0 : SCREEN_WIDTH, animated: true });
  }, []);

  const { opportunities: myOpportunities, isLoading: opportunitiesLoading } = useOpportunities({ isOwner: true, sortBy: "createdAt", sortValue: -1 });
  const insets = useSafeAreaInsets();

  // ─── Rolling 7-Day Availability Logic ───
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-indexed
  const currentYear = today.getFullYear();

  // Fetch current month's calendar data
  const { data: calendarData } = useQuery({
    queryKey: ["availability", "me", currentMonth, currentYear],
    queryFn: () => getCalendarQuery({ isOwner: true, month: currentMonth, year: currentYear }),
    enabled: !!profile?._id,
  });

  // Extract occupied date strings from calendar API response
  const occupiedDateStrings = (calendarData?.dates || [])
    .filter((d: any) => d.status === "occupied")
    .map((d: any) => new Date(d.date).toISOString().split('T')[0]);

  // Map to 7-day strip format
  const rollingSlots = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateNum = d.getDate().toString();

    const isOccupied = occupiedDateStrings.includes(dateStr);
    
    return {
      day: dayName,
      date: dateNum,
      status: isOccupied ? "booked" : "free"
    } as const;
  });

  const CARD_WIDTH = SCREEN_WIDTH * 0.82;

  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
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
      if (!profile) return;
      const payload: ProfileUpdatePayload = {
        fullName: profile.fullName || "User",
        role: profile.role || [],
        category: "single",
        signUpType: profile.signUpType || "email",
        profilePicture: url,
        location: profile.location || { type: "Point", coordinates: [0, 0] },
      };

      if (profile.socialMediaLinks && Object.keys(profile.socialMediaLinks).length > 0) {
        payload.socialMediaLinks = profile.socialMediaLinks;
      }
      if (profile.signUpType === "mobile") {
        payload.email = profile.email || "";
      } else {
        payload.mobile = profile.mobile || "";
      }

      updateProfile(payload);
    }
  });

  const displayImage = localImageUri || profileImage;

  const handleAddPost = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      // Post-selection validation for videos
      if (asset.type === 'video') {
        const { width, height } = asset;
        if (width && height) {
          const ratio = width / height;
          const is16by9 = Math.abs(ratio - 16 / 9) < 0.1 || Math.abs(ratio - 9 / 16) < 0.1;
          const is4by3 = Math.abs(ratio - 4 / 3) < 0.1 || Math.abs(ratio - 3 / 4) < 0.1;

          if (!is16by9 && !is4by3) {
            Alert.alert(
              'Invalid Video Format',
              'Please upload a 16:9 or 4:3 video.'
            );
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

  const likeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialLikeStateRef = useRef<boolean | null>(null);

  const handleToggleLike = () => {
    if (!selectedItem) return;
    const portfolioId = selectedItem._id;
    const isLiking = !selectedItem.likedByMe;

    if (initialLikeStateRef.current === null) {
      initialLikeStateRef.current = !!selectedItem.likedByMe;
    }

    // Optimistic UI update
    setSelectedItem(prev => prev ? {
      ...prev,
      likedByMe: isLiking,
      likeCount: Math.max(0, (prev.likeCount || 0) + (isLiking ? 1 : -1))
    } : null);

    // Optimistic cache update for background grid/other instances
    queryClient.setQueryData(["my-portfolio"], (oldData: any) => {
      if (!oldData) return oldData;
      const updateItem = (item: PortfolioPost) =>
        item._id === portfolioId
          ? { ...item, likedByMe: isLiking, likeCount: Math.max(0, (item.likeCount || 0) + (isLiking ? 1 : -1)) }
          : item;

      if (Array.isArray(oldData)) return oldData.map(updateItem);
      if (oldData.data) return { ...oldData, data: oldData.data.map(updateItem) };
      return oldData;
    });

    if (likeTimerRef.current) clearTimeout(likeTimerRef.current);

    // Debounce the network request
    likeTimerRef.current = setTimeout(async () => {
      const netIsLiking = isLiking;
      const initial = initialLikeStateRef.current;
      initialLikeStateRef.current = null;

      if (netIsLiking !== initial) {
        try {
          if (netIsLiking) {
            await likePortfolioPostMutation({ portfolioId });
          } else {
            await unlikePortfolioPostMutation({ portfolioId });
          }
        } catch (e: any) {
          queryClient.invalidateQueries({ queryKey: ["my-portfolio"] });
          Alert.alert("Like failed", e.message);
        }
      }
    }, 800);
  };

  const handleShare = async () => {
    if (!selectedItem) return;
    try {
      await Share.share({
        message: `Check out my portfolio post: ${selectedItem.title}\n\nhttps://camroo-launchpad-881298ae.vercel.app/portfolio/${selectedItem._id}`,
      });
    } catch (error) {
      console.log("Error sharing", error);
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
        onRequestClose={() => {
          setSelectedItem(null);
          setShowDropdown(false);
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setSelectedItem(null);
            setShowDropdown(false);
          }}
          className="flex-1 bg-black/80 items-center justify-center p-4"
        >
          <TouchableOpacity activeOpacity={1} className="w-[92%] bg-white rounded-3xl py-4 shadow-xl select-none" onPress={() => setShowDropdown(false)}>
            {/* Header Box */}
            <View className="flex-row items-center mb-3 px-4 z-10">
              {user.profileImage ? (
                <Image source={{ uri: user.profileImage }} className="w-10 h-10 rounded-full flex-shrink-0" />
              ) : (
                <View className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                  <DefaultProfilePicture />
                </View>
              )}
              <View className="flex-1 mx-3">
                <Text className="font-outfit-bold text-base text-slate-900">{user.name}</Text>
              </View>
              {selectedItem && !selectedItem.isActive && (
                <View className="bg-slate-100 px-2 py-1 rounded-full mr-2">
                  <Text className="font-outfit text-[10px] text-slate-500">Inactive</Text>
                </View>
              )}
              {selectedItem && selectedItem.visibility === "private" && (
                <View className="bg-slate-100 flex-row items-center gap-1 px-2 py-1 rounded-full">
                  <Lock size={10} color="#64748B" />
                  <Text className="font-outfit text-[10px] text-slate-500">Private</Text>
                </View>
              )}
            </View>

            {/* Title & Description OVER Media */}
            {selectedItem && (
              <View className="mb-3 px-4 z-10">
                <Text className="font-outfit-bold text-base text-slate-900 leading-tight" numberOfLines={1}>
                  {selectedItem.title || "Untitled Post"}
                </Text>
                {selectedItem.description ? (
                  <TouchableOpacity 
                    activeOpacity={0.7} 
                    onPress={() => {
                      const id = selectedItem._id;
                      setSelectedItem(null);
                      setShowDropdown(false);
                      router.push({ pathname: '/portfolio/[id]' as any, params: { id } });
                    }}
                    style={{ marginTop: 4 }}
                  >
                    <Text className="font-outfit text-sm text-slate-600 leading-relaxed" numberOfLines={2}>
                      {selectedItem.description}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {/* Full image/video edge-to-edge */}
            {selectedItem && (
              <View className="w-full bg-slate-900 items-center justify-center z-0" style={{ height: 400 }}>
                {selectedItem.mediaUrls?.mediaType === "video" ? (
                  <ModalVideoPlayer uri={selectedItem.mediaUrls?.url || ""} />
                ) : (
                  <Image
                    source={{ uri: selectedItem.mediaUrls?.url || selectedItem.coverUrls?.url || "" }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                )}
              </View>
            )}
            {/* Tags */}
            {selectedItem && selectedItem.tags && selectedItem.tags.length > 0 && (
              <View className="flex-row flex-wrap items-center gap-1.5 mt-3 px-4">
                {selectedItem.tags.slice(0, 3).map((tag) => (
                  <View key={tag} className="bg-slate-100 rounded-full px-2.5 py-1">
                    <Text className="font-outfit text-[11px] text-slate-500">{tag}</Text>
                  </View>
                ))}
                {selectedItem.tags.length > 3 && (
                  <View className="bg-slate-100 rounded-full px-2.5 py-1">
                    <Text className="font-outfit-medium text-[11px] text-[#0EA5E9]">+{selectedItem.tags.length - 3} more</Text>
                  </View>
                )}
              </View>
            )}

            {/* Footer with Details & Engagements */}
            {selectedItem && (
              <View className="flex-row items-center justify-between mt-4 px-4 z-50">
                <View className="flex-row items-center bg-slate-100 rounded-full px-2 py-1.5">
                  <TouchableOpacity onPress={handleToggleLike} className="flex-row items-center gap-1.5 px-2">
                    <Heart size={20} color={selectedItem.likedByMe ? "#EF4444" : "#64748B"} fill={selectedItem.likedByMe ? "#EF4444" : "transparent"} />
                    <Text className={`font-outfit-medium text-xs ${selectedItem.likedByMe ? "text-red-500" : "text-slate-500"}`}>
                      {selectedItem.likeCount || 0}
                    </Text>
                  </TouchableOpacity>

                  <View className="w-[1px] h-4 bg-slate-300 mx-1" />

                  <TouchableOpacity onPress={handleShare} className="flex-row items-center px-2">
                    <Share2 size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* More Options (Dropdown Trigger) */}
                <View className="relative">
                  <TouchableOpacity
                    style={{ padding: 6, backgroundColor: "#F1F5F9", borderRadius: 20 }}
                    onPress={() => setShowDropdown(!showDropdown)}
                  >
                    <MoreHorizontal size={20} color="#64748B" />
                  </TouchableOpacity>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <View className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-[100]">
                      <TouchableOpacity
                        className="px-4 py-3 border-b border-slate-50 flex-row items-center"
                        onPress={() => {
                          const postId = selectedItem._id;
                          setSelectedItem(null);
                          setShowDropdown(false);
                          router.push({ pathname: "/settings/edit-post", params: { postId } });
                        }}
                      >
                        <Pencil size={14} color="#64748B" />
                        <Text className="font-outfit-medium text-slate-700 ml-2">Edit Post</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="px-4 py-3 flex-row items-center"
                        onPress={async () => {
                          setShowDropdown(false);
                          try {
                            // Build full payload with all existing values
                            const fullPayload: Record<string, any> = {
                              title: selectedItem.title,
                              description: selectedItem.description,
                              mediaUrls: selectedItem.mediaUrls,
                              tags: selectedItem.tags || [],
                              visibility: selectedItem.visibility === "public" ? "private" : "public",
                            };
                            if (selectedItem.coverUrls) {
                              fullPayload.coverUrls = selectedItem.coverUrls;
                            }
                            await updatePortfolioMutation({
                              id: selectedItem._id,
                              payload: fullPayload,
                            });
                            queryClient.invalidateQueries({ queryKey: ["my-portfolio"] });
                            setSelectedItem(prev => prev ? { ...prev, visibility: prev.visibility === "public" ? "private" : "public" } : null);
                            Alert.alert("Success", "Visibility updated");
                          } catch (e: any) {
                            Alert.alert("Error", "Failed to update visibility");
                          }
                        }}
                      >
                        <Lock size={14} color="#64748B" />
                        <Text className="font-outfit-medium text-slate-700 ml-2">
                          {selectedItem.visibility === "public" ? "Make Private" : "Make Public"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Global Top Fade — shared component */}
      <TopGradientFade />

      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: (insets.bottom || 0) + 120 }}>
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
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8} disabled={isUploading || isUpdatingProfile} className="relative mr-4 bg-white rounded-full">
              {displayImage ? (
                <Image source={{ uri: displayImage }} className="w-24 h-24 rounded-full bg-slate-100" style={{ opacity: isUpdatingProfile ? 0.8 : 1 }} />
              ) : (
                <View className="w-24 h-24 rounded-full overflow-hidden bg-slate-100" style={{ opacity: isUpdatingProfile ? 0.8 : 1 }}>
                  <DefaultProfilePicture />
                </View>
              )}
              {(isUploading || uploadProgress > 0) ? (
                <View className="absolute inset-0 z-10 items-center justify-center pointer-events-none bg-black/50 rounded-full">
                  <ActivityIndicator size="small" color="#0EA5E9" />
                </View>
              ) : isUpdatingProfile ? (
                <View className="absolute inset-0 z-10 items-center justify-center pointer-events-none bg-black/40 rounded-full">
                  <ActivityIndicator size="small" color="#FFFFFF" />
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
              <View className="flex-row items-center mt-1.5 gap-2 flex-wrap">
                <View className="flex-row items-center gap-1">
                  <MapPin size={13} color="#64748B" />
                  <Text className="font-outfit text-sm text-slate-500 mr-2">{user.location}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Users size={13} color="#64748B" />
                  <Text className="font-outfit text-sm text-slate-500">{user.subscriberCount} Subscribers</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ─── Bio — rendered conditionally to avoid empty space ─── */}
          {user.bio ? (
            <View className="px-5 mt-4">
              <Text className="font-outfit text-sm text-slate-600 leading-relaxed">{user.bio}</Text>
            </View>
          ) : null}

          <View className="mt-4" />

          {/* ─── Availability — real data strip ─── */}
          <CollapsibleSection title="Availability" defaultOpen={true}>
            <View className="mb-4 flex-row justify-end px-1 mt-2">
              <TouchableOpacity onPress={() => router.push("/settings/availability")} className="py-2 px-3 bg-sky-50 rounded-lg">
                <Text className="font-outfit-bold text-sm text-[#0EA5E9]">Edit Schedule</Text>
              </TouchableOpacity>
            </View>
            <AvailabilityCalendar slots={rollingSlots} />
          </CollapsibleSection>

          {/* ─── Profile Tabs ─── */}
          <View className="mt-6">
            <ProfileTabBar activeTab={activeTab} onTabChange={handleTabChange} />
          </View>

          {/* ─── Tab Content ─── */}
          <ScrollView
            ref={tabScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            nestedScrollEnabled
            scrollEventThrottle={16}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveTab(newIndex === 0 ? "portfolio" : "opportunities");
            }}
          >
            <View style={{ width: SCREEN_WIDTH }}>
              <View className="flex-row flex-wrap mt-4">
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
                {isPortfolioLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <View
                      key={`skeleton-${i}`}
                      style={{ width: PORTFOLIO_ITEM_SIZE, height: PORTFOLIO_ITEM_SIZE, borderWidth: 0.5, borderColor: "#FFF", backgroundColor: "#F8FAFC", position: "relative" }}
                    >
                      <View className="absolute inset-0 bg-slate-200/40" />
                    </View>
                  ))
                ) : (
                  portfolioItems.map((item) => (
                    <TouchableOpacity
                      key={item._id}
                      activeOpacity={0.85}
                      onPress={() => setSelectedItem(item)}
                      style={{ width: PORTFOLIO_ITEM_SIZE, height: PORTFOLIO_ITEM_SIZE, borderWidth: 0.5, borderColor: "#F1F5F9", backgroundColor: "#F8FAFC", position: 'relative' }}
                    >
                      <Image source={{ uri: item.coverUrls?.url || item.mediaUrls?.url || "" }} style={{ width: "100%", height: "100%", position: "absolute" }} resizeMode="cover" />
                      {item.visibility === "private" && (
                        <View className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-1">
                          <Lock size={10} color="#FFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>


            <View style={{ width: SCREEN_WIDTH }}>
              <View className="mt-4 px-5">

                {/* Header row with My Applications link — mirrors Edit Schedule */}
                <View className="mb-4 flex-row justify-end px-1">
                  <TouchableOpacity onPress={() => router.push('/settings/my-applications' as any)} className="py-2 px-3 bg-sky-50 rounded-lg">
                    <Text className="font-outfit-bold text-sm text-[#0EA5E9]">View My Applications</Text>
                  </TouchableOpacity>
                </View>

                {/* Post new tile */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push('/opportunity/create')}
                  className="bg-slate-50 rounded-2xl p-5 mb-3 border border-slate-200 items-center justify-center"
                  style={{ minHeight: 100 }}
                >
                  <View className="w-10 h-10 rounded-full bg-white shadow-sm items-center justify-center mb-2">
                    <Plus size={18} color="#0EA5E9" />
                  </View>
                  <Text className="font-outfit-medium text-sm text-slate-500">Post New Opportunity</Text>
                </TouchableOpacity>

                {/* Posted list */}
                {opportunitiesLoading ? (
                  <View className="items-center justify-center py-6 opacity-60">
                    <Text className="font-outfit-medium text-slate-500">Loading...</Text>
                  </View>
                ) : myOpportunities.length === 0 ? (
                  <View className="items-center justify-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <Text className="font-outfit-medium text-slate-400">No opportunities posted yet.</Text>
                  </View>
                ) : (
                  myOpportunities.map((opp) => (
                    <OpportunityCard
                      key={opp._id}
                      opportunity={opp}
                      onPress={(id) => router.push({ pathname: '/opportunity/[id]' as any, params: { id } })}
                    />
                  ))
                )}

              </View>
            </View>

          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
