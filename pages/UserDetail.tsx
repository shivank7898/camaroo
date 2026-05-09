import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useConversations } from "@/hooks/useConversations";

import { createConversationMutation, subscribeUserMutation, unsubscribeUserMutation } from "@/services/mutations";
import { getUserByIdQuery, getUserPortfolioQuery, getCalendarQuery } from "@/services/queries";
import { useOpportunities } from "@/hooks/useOpportunities";

import {
  ArrowLeft,
  MapPin,
  Briefcase,
  MessageCircle,
  UserPlus,
  UserCheck,
  Users
} from "lucide-react-native";

// Shared components
import TopGradientFade from "@/components/ui/TopGradientFade";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import AvailabilityCalendar from "@/components/profile/AvailabilityCalendar";
import SocialIconsRow from "@/components/profile/SocialIconsRow";
import { ProfileTabBar, type ProfileTabSpec } from "@/components/profile/ProfileTabBar";
import { OpportunityCard } from "@/components/opportunity/OpportunityCard";
import DefaultProfilePicture from "@/components/ui/DefaultProfilePicture";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function UserDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const currentAuthUser = useAuthStore(s => s.user);
  const isMe = currentAuthUser?.id === id;

  // ─── Queries ───
  // User Data
  const { data: userResponse, isLoading: userLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserByIdQuery(id),
    enabled: !!id,
  });
  const user = (userResponse as any)?.data || userResponse; // Safely unpack nested response

  // Portfolio
  const { data: portfolioResponse, isLoading: portfolioLoading } = useQuery({
    queryKey: ["userPortfolio", id],
    queryFn: () => getUserPortfolioQuery({ userId: id }),
    enabled: !!id,
  });
  const portfolioItems = portfolioResponse?.data || [];

  // Opportunities
  const { opportunities: userOpportunities, isLoading: opportunitiesLoading } = useOpportunities({ 
    userId: id, 
    sortBy: "createdAt", 
    sortValue: -1 
  });

  // ─── Chat Routing ───
  const { conversations } = useConversations();
  const [isStartingChat, setIsStartingChat] = useState(false);

  const handleStartChat = async () => {
    if (!id) return;
    const avatarUrl = user?.profilePicture || "";
    const fullName = user?.fullName || "Chat";
    
    // Existing room detection
    const existingConv = conversations.find(c => 
      c.participants?.some((p: any) => p._id === id || p.id === id) && (c.participants?.length || 0) === 2
    );
    
    if (existingConv) {
      router.push({
        pathname: "/chat/[id]" as any,
        params: { id: existingConv._id, name: fullName, avatar: avatarUrl }
      });
      return;
    }
    
    try {
      setIsStartingChat(true);
      const res = await createConversationMutation(id);
      const newConvId = res?.data?._id || res?._id || res?.conversation?._id || id;
      router.push({
        pathname: "/chat/[id]" as any,
        params: { id: newConvId, name: fullName, avatar: avatarUrl }
      });
    } catch (err: any) {
      if (!err?.message?.includes("not found")) {
         Alert.alert("Chat Error", "Could not start a conversation.");
      }
    } finally {
      setIsStartingChat(false);
    }
  };

  // ─── Rolling 7-Day Availability Logic ───
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const { data: calendarData } = useQuery({
    queryKey: ["availability", id, currentMonth, currentYear],
    queryFn: () => getCalendarQuery({ userId: id, month: currentMonth, year: currentYear }),
    enabled: !!id,
  });

  // Extract occupied date strings from calendar API response
  // API returns: { dates: [{ date: "2026-04-06T00:00:00.000Z", status: "occupied" }] }
  const occupiedDateStrings = (calendarData?.dates || [])
    .filter((d: any) => d.status === "occupied")
    .map((d: any) => new Date(d.date).toISOString().split('T')[0]);

  const rollingSlots = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateNum = d.getDate().toString();
    const isOccupied = occupiedDateStrings.includes(dateStr);
    
    return {
      day: dayName,
      date: dateNum,
      status: isOccupied ? "booked" : "free"
    } as const;
  });

  // Tab State
  const [activeTab, setActiveTab] = useState<ProfileTabSpec>("portfolio");
  const tabScrollRef = useRef<ScrollView>(null);

  const [localSubscribed, setLocalSubscribed] = useState(false);
  const [localSubCount, setLocalSubCount] = useState(0);

  useEffect(() => {
    if (user) {
      setLocalSubscribed(user.isSubscribed || false);
      setLocalSubCount(user.subscriberCount || 0);
    }
  }, [user]);

  const toggleSubscribe = async () => {
    if (!id) return;
    const wasSubscribed = localSubscribed;
    setLocalSubscribed(!wasSubscribed);
    setLocalSubCount(prev => Math.max(0, prev + (wasSubscribed ? -1 : 1)));
    try {
      if (wasSubscribed) {
        await unsubscribeUserMutation(id);
      } else {
        await subscribeUserMutation({ userId: id });
      }
    } catch (err: any) {
      // Revert optimistic changes
      setLocalSubscribed(wasSubscribed);
      setLocalSubCount(prev => Math.max(0, prev + (wasSubscribed ? 1 : -1)));
      Alert.alert(
        wasSubscribed ? "Unsubscribe Failed" : "Subscribe Failed",
        err.message || "An issue occurred communicating with the server."
      );
    }
  };

  const handleTabChange = useCallback((newTab: ProfileTabSpec) => {
    setActiveTab(newTab);
    tabScrollRef.current?.scrollTo({ x: newTab === "portfolio" ? 0 : SCREEN_WIDTH, animated: true });
  }, []);

  if (userLoading || !userResponse) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  // ─── Safe Parse Mapping ───
  const profilePic = user.profilePicture;

  // Render Portfolio Tab
  const renderPortfolioTab = () => {
    if (portfolioLoading) return <ActivityIndicator className="mt-8" color="#0ea5e9" />;
    if (portfolioItems.length === 0) {
      return (
        <View className="mt-8 items-center justify-center px-5">
          <Text className="font-outfit text-slate-400">No portfolio posts yet.</Text>
        </View>
      );
    }
    return (
      <View className="flex-row flex-wrap">
        {portfolioItems.map((post: any) => {
          const fileUrl = post?.coverUrls?.url || post?.mediaUrls?.url || "";
          if (!fileUrl) return null;
          const isVideo = post?.mediaUrls?.mediaType === "video";
          return (
            <TouchableOpacity 
              key={post._id}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/portfolio/[id]' as any, params: { id: post._id } })}
              style={{ 
                width: Math.floor(SCREEN_WIDTH / 3), 
                height: Math.floor(SCREEN_WIDTH / 3), 
                borderWidth: 0.5, 
                borderColor: "#FFF", 
                backgroundColor: "#F1F5F9",
                position: "relative"
              }}
            >
              <Image
                source={{ uri: fileUrl }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              {isVideo && (
                <View className="absolute bottom-1.5 right-1.5 bg-black/60 rounded-full px-1.5 py-0.5">
                  <Text className="text-white text-[9px] font-outfit-medium">▶ Video</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Render Opportunities Tab
  const renderOpportunitiesTab = () => {
    if (opportunitiesLoading) return <ActivityIndicator className="mt-8" color="#0ea5e9" />;
    if (!userOpportunities || userOpportunities.length === 0) {
      return (
        <View className="mt-8 items-center justify-center px-5">
          <Text className="font-outfit text-slate-400">No opportunities available.</Text>
        </View>
      );
    }
    return (
      <>
        {userOpportunities.map((opp) => (
          <View key={opp._id} className="mb-4 mx-5">
            <OpportunityCard 
              opportunity={opp} 
              onPress={() => router.push({ pathname: '/opportunity/[id]' as any, params: { id: opp._id } })} 
            />
          </View>
        ))}
      </>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Global Top Fade */}
      <TopGradientFade />

      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* ─── Top Bar ─── */}
          <View className="px-5 py-3 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-11 h-11 items-center justify-center mr-1 -ml-3"
            >
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <View className="flex-row items-center justify-end">
              {/* Optional secondary actions can go here */}
            </View>
          </View>

          {/* ─── Profile Header ─── */}
          <View className="px-5 mt-2 flex-row items-start">
            {profilePic ? (
              <Image
                source={{ uri: profilePic }}
                className="w-[88px] h-[88px] rounded-full mr-4 bg-slate-100 flex-shrink-0"
              />
            ) : (
              <View className="w-[88px] h-[88px] rounded-full mr-4 overflow-hidden bg-slate-100 flex-shrink-0">
                <DefaultProfilePicture />
              </View>
            )}
            <View className="flex-1 pt-1">
              <View className="flex-row items-center justify-between">
                <Text className="font-outfit-bold text-2xl text-black flex-1" numberOfLines={1}>
                  {user.fullName || "User"}
                </Text>
                {!isMe && (
                  <TouchableOpacity 
                    onPress={toggleSubscribe}
                    className={`w-9 h-9 rounded-full items-center justify-center border ml-2 ${localSubscribed ? 'bg-[#0EA5E9] border-[#0EA5E9]' : 'border-[#0EA5E9]/40'}`}
                  >
                    {localSubscribed ? (
                      <UserCheck size={16} color="#FFF" />
                    ) : (
                      <UserPlus size={16} color="#0EA5E9" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
              <Text className="font-outfit-medium text-sm text-slate-500 mt-0.5">
                {[...(user.role || []), user.specialization].filter(Boolean).join(" • ")}
              </Text>
              <View className="flex-row items-center mt-1.5 gap-2 flex-wrap">
                <View className="flex-row items-center gap-1">
                  <MapPin size={13} color="#64748B" />
                  <Text className="font-outfit text-sm text-slate-500 mr-2">{user.address || user.city || "Unknown Location"}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Users size={13} color="#64748B" />
                  <Text className="font-outfit text-sm text-slate-500">{localSubCount} Subscribers</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ─── Bio Row ─── */}
          <View className="px-5 mt-4">
             <Text className="font-outfit text-sm text-slate-600 leading-relaxed">
               {user.yearsOfExperience ? `${user.yearsOfExperience} years of professional experience.` : "New to Camaroo."}
             </Text>
          </View>

          {/* ─── Social & Contact Icons & Comm ─── */}
          {!isMe && (
            <View className="flex-row items-center justify-between px-5 mt-4 mb-2">
              <View className="flex-1 mr-4">
                <SocialIconsRow
                  email={user.email}
                  phone={user.mobile}
                  instagram={user.socialMediaLinks?.instagram}
                  youtube={user.socialMediaLinks?.youtube}
                  website={user.socialMediaLinks?.website}
                />
              </View>
              <TouchableOpacity
                onPress={handleStartChat}
                disabled={isStartingChat}
                className="bg-[#0EA5E9] flex-row items-center justify-center rounded-full px-5 h-10 shadow-sm shadow-blue-200"
                style={{ opacity: isStartingChat ? 0.5 : 1 }}
              >
                {isStartingChat ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <MessageCircle size={18} color="#FFF" strokeWidth={2.2} />
                    <Text className="font-outfit-bold text-white ml-2 text-sm">Chat</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ─── Availability ─── */}
          <CollapsibleSection title="Availability" defaultOpen={true}>
            <AvailabilityCalendar slots={rollingSlots} />
          </CollapsibleSection>

          {/* ─── Tab Bar ─── */}
          <View className="mt-2">
            <ProfileTabBar activeTab={activeTab} onTabChange={handleTabChange} />
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
              <View style={{ width: SCREEN_WIDTH }} className="pt-4">
                {renderPortfolioTab()}
              </View>
              <View style={{ width: SCREEN_WIDTH }} className="pt-4">
                {renderOpportunitiesTab()}
              </View>
            </ScrollView>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

