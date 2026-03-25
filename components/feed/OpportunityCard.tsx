import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Avatar } from "../Avatar";
import { Tag, Calendar, Clock } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_HEIGHT = SCREEN_WIDTH + 80;

interface OpportunityCardProps {
  id: string;
  name: string;
  avatar: string;
  time: string;
  location: string;
  title: string;
  budget: string;
  description: string;
  category: string;
  shootType: string;
  date: string;
  duration: string;
  onApply?: (id: string) => void;
}

/**
 * OpportunityCard
 * Feed card for hire opportunity posts — shows job metadata grid
 * (category, shoot type, date, duration) and an Apply Now CTA.
 *
 * Props:
 *   id, name, avatar, time, location, title, budget,
 *   description, category, shootType, date, duration
 *   onApply? → called with opportunity id when Apply is tapped
 *
 * Functions: none (pure display with optional onApply callback)
 */
function OpportunityCard({
  id, name, avatar, time, location, title, budget,
  description, category, shootType, date, duration, onApply,
}: OpportunityCardProps) {
  return (
    <View className="bg-white px-5 py-4 mb-2 border-b border-black/5" style={{ minHeight: CARD_HEIGHT }}>
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <Avatar source={{ uri: avatar }} size={48} />
        <View className="ml-3">
          <Text className="font-outfit-bold text-black text-base">{name}</Text>
          <Text className="font-outfit text-[#6B7280] text-xs mt-0.5">{time} • {location}</Text>
        </View>
      </View>

      {/* Content Box */}
      <View className="flex-1 bg-slate-50 p-5 rounded-[24px] border border-slate-100 justify-between">
        <View>
          <View className="flex-row items-start justify-between mb-3">
            <Text className="font-outfit-bold text-xl text-black flex-1 pr-4 leading-tight">
              {title}
            </Text>
            <View className="px-3 py-1 bg-[#0EA5E9]/10 rounded-lg">
              <Text className="font-outfit-bold text-[#0EA5E9] text-sm">{budget}</Text>
            </View>
          </View>
          <Text className="font-outfit text-sm leading-relaxed text-slate-600 mb-5">
            {description}
          </Text>
        </View>

        <View className="mt-auto">
          {/* Metadata Grid */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            <View className="flex-row items-center bg-white px-3 py-2 rounded-xl border border-black/5 shadow-sm">
              <Tag size={14} color="#64748B" />
              <Text className="font-outfit-medium text-slate-700 text-xs ml-1.5">{category}</Text>
            </View>
            <View className="flex-row items-center bg-white px-3 py-2 rounded-xl border border-black/5 shadow-sm">
              <View className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <Text className="font-outfit-medium text-slate-700 text-xs ml-1.5">{shootType}</Text>
            </View>
            <View className="flex-row items-center bg-white px-3 py-2 rounded-xl border border-black/5 shadow-sm">
              <Calendar size={14} color="#64748B" />
              <Text className="font-outfit-medium text-slate-700 text-xs ml-1.5">{date}</Text>
            </View>
            <View className="flex-row items-center bg-white px-3 py-2 rounded-xl border border-black/5 shadow-sm">
              <Clock size={14} color="#64748B" />
              <Text className="font-outfit-medium text-slate-700 text-xs ml-1.5">{duration}</Text>
            </View>
          </View>

          {/* Apply CTA */}
          <TouchableOpacity
            className="w-full bg-[#1E293B] py-4 rounded-xl items-center shadow-sm"
            onPress={() => onApply?.(id)}
          >
            <Text className="text-white font-outfit-bold text-base">Apply Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default React.memo(OpportunityCard);
