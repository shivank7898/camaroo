import React, { useState, useRef, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, type ViewToken, DeviceEventEmitter } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, Search, Hammer } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useScrollToTop } from "@react-navigation/native";
import DefaultProfilePicture from "@/components/ui/DefaultProfilePicture";

// Shared components
import TopGradientFade from "@components/ui/TopGradientFade";
import DiscoveryCard from "@components/feed/DiscoveryCard";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import type { OpportunityFilters } from "@/types/opportunity";

import { useQuery } from "@tanstack/react-query";
import { fetchMe, getUserPortfolioQuery, searchUsersQuery } from "@services/queries";
import { useUserStore } from "@store/userStore";
import { useAuthStore } from "@store/authStore";
import { UserProfile, Subscription } from "@/types/auth";

interface MeResponse {
  user: UserProfile;
  subscription: Subscription | null;
}

// ── Viewability config (stable ref, never recreated) ─────────────────────────
const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 60,
  minimumViewTime: 250,
};

export default function HomeFeed({ mode = "portfolio" }: { mode?: "portfolio" | "market" }) {
  const router = useRouter();
  const { user: authUser } = useAuthStore();
  const userData = useUserStore((s) => s.userData);
  const setUserData = useUserStore((s) => s.setUserData);

  const profile = userData?.user || authUser;
  console.log("[HomeFeed Topbar] Target Profile Pic URL:", (profile as any)?.profilePicture);

  // ── Me query ──
  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  const scrollRef = useRef<any>(null);
  useScrollToTop(scrollRef);

  React.useEffect(() => {
    const sub = DeviceEventEmitter.addListener('scrollToTopFeed', () => {
      if (scrollRef.current?.scrollToOffset) {
        scrollRef.current.scrollToOffset({ offset: 0, animated: true });
      } else if (scrollRef.current?.scrollTo) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
    });
    return () => sub.remove();
  }, []);

  React.useEffect(() => {
    if (meData) {
      const typedData = meData as unknown as MeResponse;
      if (typedData.user) {
        setUserData(typedData.user, typedData.subscription);
      }
    }
  }, [meData, setUserData]);

  // ── Portfolio feed query ──
  const { data: globalPortfolioResponse, isLoading: isPortfolioLoading } = useQuery({
    queryKey: ["global-portfolio-feed"],
    queryFn: () => getUserPortfolioQuery(),
  });

  const globalPortfolio = globalPortfolioResponse?.data || [];

  // ── Video viewability: single active post ──
  const [activePostId, setActivePostId] = useState<string | null>(null);
  // ── Global audio: only one video unmuted at a time ──
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  // ── Most-visible-item selection (stable ref) ──
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!viewableItems?.length) {
        setActivePostId(null);
        return;
      }
      // Pick the most visible item
      const mostVisible = viewableItems.reduce((prev, current) => {
        const prevPct = (prev as any).percentVisible ?? 0;
        const currPct = (current as any).percentVisible ?? 0;
        return currPct > prevPct ? current : prev;
      });
      setActivePostId((mostVisible.item as any)?._id ?? null);
    }
  ).current;

  // Clear active video when navigating away — fully unmounts the player
  useFocusEffect(
    useCallback(() => {
      return () => {
        setActivePostId(null);
        setActiveAudioId(null);
      };
    }, [])
  );

  const insets = useSafeAreaInsets();

  const { data: searchResponse, isLoading: isDiscoverLoading } = useQuery({
    queryKey: ["discoverUsersTop"],
    queryFn: () => searchUsersQuery(""),
  });
  
  const discoveryProfiles = React.useMemo(() => {
    let arr = searchResponse?.data?.data || searchResponse?.data || searchResponse || [];
    if (!Array.isArray(arr)) arr = [];
    const currentUserId = (profile as any)?._id || (profile as any)?.id;
    return arr.filter((u: any) => u._id !== currentUserId && u.id !== currentUserId).slice(0, 10);
  }, [searchResponse, profile]);

  const handleDiscoveryPress = useCallback((id: string) => {
    router.push(`/user/${id}`);
  }, [router]);

  const renderDiscoveryItem = useCallback(({ item }: { item: any }) => (
    <DiscoveryCard
      id={item._id || item.id}
      name={item.full_name || item.fullName || "User"}
      image={item.profile_picture || item.profilePicture || ""}
      role={item.category || ""}
      location=""
      isAvailable={item.is_available ?? true}
      onPress={handleDiscoveryPress}
    />
  ), [handleDiscoveryPress]);

  // ── FlatList header: Discovery + title ──
  const ListHeader = useCallback(() => (
    <View>
      {/* Discovery section */}
      <View className="mt-2 mb-6">
        <View className="flex-row items-center justify-between px-5 mb-4">
          <Text className="font-outfit-bold text-lg text-black">Discover Artists</Text>
          <TouchableOpacity onPress={() => router.push("/discovery")}>
            <Text className="font-outfit-medium text-sm text-sky-500">View More</Text>
          </TouchableOpacity>
        </View>

        {/* Discovery Cards Strip */}
        {isDiscoverLoading ? (
           <ActivityIndicator size="small" color="#0ea5e9" className="py-4" />
        ) : (
          <FlatList
            horizontal
            data={discoveryProfiles}
            keyExtractor={(item: any) => item._id || item.id}
            renderItem={renderDiscoveryItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 6 }}
            ListEmptyComponent={
              <Text className="font-outfit-medium text-slate-400 pl-2">No up-and-coming creatives to discover yet.</Text>
            }
          />
        )}
      </View>

      {/* Section title */}
      <Text className="px-5 font-outfit-bold text-lg text-black mb-4">
        {mode === "portfolio" ? "Feed Activity" : "Coming Soon"}
      </Text>
    </View>
  ), [mode, discoveryProfiles, renderDiscoveryItem]);

  // ── Render item for FlatList ──
  const renderPortfolioItem = useCallback(
    ({ item }: { item: any }) => (
      <PortfolioCard
        post={item}
        isActive={activePostId === item._id}
        activeAudioId={activeAudioId}
        onUnmute={setActiveAudioId}
      />
    ),
    [activePostId, activeAudioId]
  );

  const keyExtractor = useCallback((item: any) => item._id, []);

  return (
    <View className="flex-1 bg-white">
      <TopGradientFade />

      <SafeAreaView className="flex-1 relative" edges={["top"]}>
        {/* Header */}
        <View className="px-5 py-4 flex-row justify-between items-center z-20">
          <View className="flex-row items-center gap-3 mt-2">
            <Text className="text-3xl font-outfit-bold text-black tracking-tight">Home</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-sm border border-black/5">
              <Search size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-sm border border-black/5">
              <Bell size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
            >
              {((profile as any)?.profilePicture || (profile as any)?.profile_picture) ? (
                <Image
                  source={{ uri: (profile as any)?.profilePicture || (profile as any)?.profile_picture }}
                  className="w-11 h-11 rounded-full border-2 border-white shadow-sm bg-slate-100"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-11 h-11 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100">
                  <DefaultProfilePicture />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Feed / Market content */}
        {mode === "portfolio" ? (
          isPortfolioLoading ? (
            <View className="flex-1 items-center justify-center">
              <Text className="font-outfit-medium text-slate-500 opacity-60">Loading Feed...</Text>
            </View>
          ) : (
            <FlatList
              data={globalPortfolio}
              keyExtractor={keyExtractor}
              renderItem={renderPortfolioItem}
              ListHeaderComponent={<ListHeader />}
              ListEmptyComponent={
                <Text className="font-outfit-medium text-slate-400 text-center py-10">No portfolio posts found.</Text>
              }
              viewabilityConfig={VIEWABILITY_CONFIG}
              onViewableItemsChanged={onViewableItemsChanged}
              ref={scrollRef}
              removeClippedSubviews
              initialNumToRender={3}
              maxToRenderPerBatch={5}
              windowSize={3}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: (insets.bottom || 0) + 120 }}
            />
          )
        ) : (
          <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: (insets.bottom || 0) + 120 }}>
            <ListHeader />
            <View className="items-center justify-center py-10 mt-8 px-10">
              <View className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl items-center justify-center mb-6 shadow-sm">
                <Hammer size={32} color="#0EA5E9" />
              </View>
              <Text className="font-outfit-bold text-2xl text-slate-900 mb-2 text-center">Marketplace</Text>
              <Text className="font-outfit text-sm text-slate-500 text-center leading-relaxed">
                We are currently building this feature. Camaroo's gear market will be available soon!
              </Text>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
