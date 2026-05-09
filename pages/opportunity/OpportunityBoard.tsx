import React, { useState, useCallback } from "react";
import { View, FlatList, RefreshControl, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useOpportunities } from "@/hooks/useOpportunities";
import { OpportunityCard } from "@/components/opportunity/OpportunityCard";
import { OpportunityFiltersBar } from "@/components/opportunity/OpportunityFilters";
import type { OpportunityFilters } from "@/types/opportunity";

export default function OpportunityBoard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [filters, setFilters] = useState<OpportunityFilters>({
    status: "open",
    sortBy: "createdAt",
    sortValue: -1,
  });

  const { opportunities, isLoading, isFetching, refreshOpportunities, isError } = useOpportunities(filters);

  const handleFilterChange = useCallback((key: keyof OpportunityFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleCardPress = useCallback((id: string) => {
    router.push({ pathname: "/opportunity/[id]" as any, params: { id } });
  }, [router]);

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header Container */}
      <View className="px-5 pb-2 pt-4 bg-white z-10 border-b border-slate-100">
        <Text className="font-outfit-bold text-2xl text-slate-900 mb-4">Opportunities</Text>
        <OpportunityFiltersBar filters={filters} onChange={handleFilterChange} />
      </View>

      <FlatList
        data={opportunities}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20, paddingBottom: (insets.bottom || 0) + 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading || isFetching} onRefresh={refreshOpportunities} tintColor="#0EA5E9" />
        }
        renderItem={({ item }) => (
          <OpportunityCard opportunity={item} onPress={handleCardPress} />
        )}
        ListEmptyComponent={
          !isLoading && !isFetching ? (
            <View className="items-center justify-center py-20 opacity-60">
              <Text className="font-outfit-medium text-slate-500">No opportunities found.</Text>
            </View>
          ) : null
        }
      />

      {/* Main Floating Action Button for Posting an Opportunity */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push("/opportunity/create")}
        style={{
          position: "absolute",
          bottom: (insets.bottom || 0) + 24,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#0EA5E9",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#0EA5E9",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}
