import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Search } from "lucide-react-native";
import { useRouter } from "expo-router";

// Shared components
import TopGradientFade from "@components/ui/TopGradientFade";
import DiscoveryCard from "@components/feed/DiscoveryCard";
import PortfolioFeedCard from "@components/feed/PortfolioFeedCard";
import OpportunityCard from "@components/feed/OpportunityCard";
import MarketplaceCard from "@components/feed/MarketplaceCard";

// Types
import { FeedItem } from "@app-types/feed";

// Demo data
import { MOCK_DISCOVERY_PROFILES, MOCK_FEED } from "@constants";
import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "@services/queries";
import { useUserStore } from "@store/userStore";
import { UserProfile, Subscription } from "@/types/auth";

interface MeResponse {
  user: UserProfile;
  subscription: Subscription | null;
}

export default function HomeFeed() {
  const router = useRouter();
  const setUserData = useUserStore((s) => s.setUserData);

  // Fetch full profile when reaching home
  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  React.useEffect(() => {
    if (meData) {
      const typedData = meData as unknown as MeResponse;
      if (typedData.user) {
        setUserData(typedData.user, typedData.subscription);
      }
    }
  }, [meData, setUserData]);

  const discoveryProfiles = MOCK_DISCOVERY_PROFILES;
  const timelineData: FeedItem[] = MOCK_FEED;

  return (
    <View className="flex-1 bg-white">
      {/* Shared Gradient Fade */}
      <TopGradientFade />
      
      <SafeAreaView className="flex-1 relative" edges={['top']}>
        {/* Header */}
        <View className="px-5 py-4 flex-row justify-between items-center z-20">
          <View className="flex-row items-center gap-3 mt-2">
            <Text className="text-3xl font-outfit-bold text-black tracking-tight" style={{ marginLeft: 2 }}>Home</Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm border border-black/5">
              <Bell size={22} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm border border-black/5">
              <Search size={22} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Profile Discovery + Filters Group */}
          <View className="mt-2 mb-6">
            <View className="flex-row items-center justify-between px-5 mb-3">
              <Text className="font-outfit-bold text-lg text-black">Discover Creatives</Text>
            </View>

            {/* Filter Pills */}
            <View className="mb-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
                <TouchableOpacity className="flex-row items-center bg-white px-4 py-2.5 rounded-full border border-black/10 shadow-sm">
                  <Text className="font-outfit-medium text-slate-700 text-sm">Category</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center bg-white px-4 py-2.5 rounded-full border border-black/10 shadow-sm">
                  <Text className="font-outfit-medium text-slate-700 text-sm">Location</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center bg-white px-4 py-2.5 rounded-full border border-black/10 shadow-sm">
                  <Text className="font-outfit-medium text-slate-700 text-sm">Date</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Discovery Cards Strip - now using DiscoveryCard shared component */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20 }}>
              {discoveryProfiles.map(profile => (
                <DiscoveryCard 
                  key={profile.id}
                  {...profile}
                  onPress={(id) => router.push(`/user/${id}`)}
                />
              ))}
              <View className="w-6" />
            </ScrollView>
          </View>

          {/* Feed Posts - now using shared feed cards */}
          <View>
            <Text className="px-5 font-outfit-bold text-lg text-black mb-4">Feed Activity</Text>
            {timelineData.map((post) => {
              switch (post.type) {
                case "portfolio":
                  return (
                    <PortfolioFeedCard 
                      key={post.id} 
                      {...post} 
                      onUserPress={(id) => router.push(`/user/${id}`)}
                    />
                  );
                case "opportunity":
                  return (
                    <OpportunityCard 
                      key={post.id} 
                      {...post} 
                      onApply={(id) => console.log('apply', id)}
                    />
                  );
                case "marketplace":
                  return (
                    <MarketplaceCard 
                      key={post.id} 
                      {...post} 
                      onPress={(id) => console.log('view details', id)}
                    />
                  );
                default:
                  return null;
              }
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
