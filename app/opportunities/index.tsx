import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import TopGradientFade from "@/components/ui/TopGradientFade";
import { OpportunityCard } from "@/components/opportunity/OpportunityCard";
import { useOpportunities } from "@/hooks/useOpportunities";
import type { OpportunityFilters } from "@/types/opportunity";

export default function OpportunitiesFeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [oppFilters, setOppFilters] = useState<OpportunityFilters>({
    status: "open",
    sortBy: "createdAt",
    sortValue: -1,
  });

  const { opportunities, isLoading } = useOpportunities(oppFilters);

  return (
    <View className="flex-1 bg-white">
      <TopGradientFade />
      <SafeAreaView className="flex-1 relative" edges={["top"]}>
        {/* Header */}
        <View className="px-5 py-4 flex-row justify-between items-center z-20 border-b border-black/5 mb-2">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 items-center justify-center mr-2 -ml-3">
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-2xl font-outfit-bold text-black tracking-tight">Opportunities</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: (insets.bottom || 0) + 120 }}>
          <View className="px-5 mt-2">
            {isLoading ? (
              <Text className="font-outfit-medium text-slate-500 text-center py-10 opacity-60">Loading...</Text>
            ) : opportunities.length === 0 ? (
              <Text className="font-outfit-medium text-slate-400 text-center py-10">No opportunities found.</Text>
            ) : (
              opportunities.map((opp) => (
                <View key={opp._id} className="mb-4">
                  <OpportunityCard
                    opportunity={opp}
                    onPress={(id) => router.push({ pathname: "/opportunity/[id]" as any, params: { id } })}
                  />
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
