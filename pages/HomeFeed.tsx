import React, { useState, useRef, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, type ViewToken, DeviceEventEmitter, TextInput } from "react-native";
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
import MarketplaceItemCard from "@/components/feed/MarketplaceItemCard";

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
        {mode === "portfolio" ? "Feed Activity" : "Gear Market"}
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
          <FlatList
            ref={scrollRef}
            data={[
              { id: "1", title: "Canon EOS R5", price: "₹3000/ day", location: "Mumbai", thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400&h=300" },
              { id: "2", title: "Sony A7 IV", price: "₹2500/ day", location: "Delhi", thumbnail: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=400&h=300" },
              { id: "3", title: "DJI Mavic 3", price: "₹4500/ day", location: "Bangalore", thumbnail: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&q=80&w=400&h=300" },
              { id: "4", title: "Red Komodo 6K", price: "₹9000/ day", location: "Mumbai", thumbnail: "https://images.unsplash.com/photo-1589806086701-a18d1ebae51d?auto=format&fit=crop&q=80&w=400&h=300" }
            ]}
            keyExtractor={(item) => item.id}
            numColumns={2}
            removeClippedSubviews
            initialNumToRender={4}
            columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 20 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: (insets.bottom || 0) + 120, paddingTop: 10 }}
            ListHeaderComponent={
              <View>
                <ListHeader />
                {/* Advanced Search / Filters Row mapping to API */}
                <View className="px-5 mb-4 mt-2">
                  <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4">
                    <Search size={18} color="#94A3B8" style={{marginRight: 8}} />
                    <TextInput 
                      placeholder="Search gear, categories, models..." 
                      className="flex-1 font-outfit text-slate-800 p-0 m-0" 
                      placeholderTextColor="#94A3B8" 
                    />
                  </View>
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row overflow-visible">
                    <TouchableOpacity className="bg-sky-50 px-4 py-2.5 rounded-full border border-sky-200 mr-2 flex-row items-center">
                      <Text className="font-outfit-bold text-sky-600 text-[13px]">For Rent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-white px-4 py-2.5 rounded-full border border-slate-200 mr-2 flex-row items-center shadow-sm shadow-slate-100">
                      <Text className="font-outfit-medium text-slate-600 text-[13px]">For Sale</Text>
                    </TouchableOpacity>
                    <View className="w-[1px] h-6 bg-slate-200 mx-1 mr-3 self-center" />
                    <TouchableOpacity className="bg-white px-4 py-2.5 rounded-full border border-slate-200 mr-2 flex-row items-center shadow-sm shadow-slate-100">
                      <Text className="font-outfit-medium text-slate-600 text-[13px]">Price: Any</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-white px-4 py-2.5 rounded-full border border-slate-200 mr-2 flex-row items-center shadow-sm shadow-slate-100">
                      <Text className="font-outfit-medium text-slate-600 text-[13px]">Newest First</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>

                {/* Popular Near You header */}
                <View className="px-5 flex-row items-center justify-between mt-2 mb-3">
                  <Text className="font-outfit-bold text-lg text-slate-800">Popular Near You</Text>
                  <TouchableOpacity>
                    <Text className="font-outfit-medium text-sm text-slate-500">See All &gt;</Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <MarketplaceItemCard
                id={item.id}
                title={item.title}
                price={item.price}
                location={item.location}
                thumbnail={item.thumbnail}
                onPress={(id) => router.push(`/marketplace/${id}`)}
              />
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
