import React, { memo } from "react";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";
import type { OpportunityFilters } from "@/types/opportunity";

interface FiltersProps {
  filters: OpportunityFilters;
  onChange: (key: keyof OpportunityFilters, value: any) => void;
}

const STATUS_OPTIONS = [
  { label: "All", value: undefined },
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
];

const OpportunityFiltersComponent = ({ filters, onChange }: FiltersProps) => {
  return (
    <View className="mb-4">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
      >
        {STATUS_OPTIONS.map((opt) => {
          const isActive = filters.status === opt.value;
          return (
            <TouchableOpacity
              key={opt.label}
              activeOpacity={0.7}
              onPress={() => onChange("status", opt.value)}
              className={`px-4 py-2 rounded-full border ${isActive ? "bg-sky-500 border-sky-500" : "bg-white border-slate-200"}`}
            >
              <Text className={`font-outfit-medium text-xs ${isActive ? "text-white" : "text-slate-600"}`}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Example Location rough filter - could hook up to real modal picker */}
        <TouchableOpacity
          activeOpacity={0.7}
          className="px-4 py-2 rounded-full border border-slate-200 bg-white"
        >
          <Text className="font-outfit-medium text-xs text-slate-600">
            {filters.location ? `Location: ${filters.location}` : "Location"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export const OpportunityFiltersBar = memo(OpportunityFiltersComponent);
