import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  MessageCircle,
  UserPlus,
} from "lucide-react-native";

// Shared components
import TopGradientFade from "@components/ui/TopGradientFade";
import CollapsibleSection from "@components/ui/CollapsibleSection";
import AvailabilityCalendar from "@components/profile/AvailabilityCalendar";
import SocialIconsRow from "@components/profile/SocialIconsRow";

// Demo data
import { MOCK_USER } from "@constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PORTFOLIO_ITEM_SIZE = Math.floor(SCREEN_WIDTH / 3);

export default function UserDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const user = MOCK_USER;

  return (
    <View className="flex-1 bg-white">
      {/* Global Top Fade — shared component */}
      <TopGradientFade />

      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* ─── Top Bar: Back ← · · · Hire · Chat → ─── */}
          <View className="px-5 py-3 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-11 h-11 items-center justify-center mr-1"
            >
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <View className="flex-row items-center justify-end">
              <TouchableOpacity className="w-11 h-11 items-center justify-center mr-1">
                <Briefcase size={24} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity className="w-11 h-11 items-center justify-center">
                <MessageCircle size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── Profile Header ─── */}
          <View className="px-5 mt-2 flex-row items-start">
            <Image
              source={{ uri: user.profileImage }}
              className="w-24 h-24 rounded-full mr-4"
            />
            <View className="flex-1 pt-1">
              <View className="flex-row items-center justify-between">
                <Text className="font-outfit-bold text-2xl text-black flex-1" numberOfLines={1}>
                  {user.name}
                </Text>
                <TouchableOpacity className="w-9 h-9 rounded-full items-center justify-center border border-[#0EA5E9]/40 ml-2">
                  <UserPlus size={16} color="#0EA5E9" />
                </TouchableOpacity>
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
            <AvailabilityCalendar slots={user.availability} />
          </CollapsibleSection>

          {/* ─── Portfolio Grid ─── */}
          <View className="mt-6">
            <View className="flex-row flex-wrap">
              {user.portfolio.map((img: any, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.85}
                  style={{
                    width: PORTFOLIO_ITEM_SIZE,
                    height: PORTFOLIO_ITEM_SIZE,
                    borderWidth: 0.5,
                    borderColor: "#FFF",
                  }}
                >
                  <Image
                    source={{ uri: img }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
