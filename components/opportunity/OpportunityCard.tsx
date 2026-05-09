import React, { memo } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { MapPin, Calendar, Clock, ChevronRight } from "lucide-react-native";
import type { Opportunity } from "@/types/opportunity";
import { useRouter } from "expo-router";
import { useAuthStore } from "@store/authStore";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onPress: (id: string) => void;
  hideCreator?: boolean;
}

const OpportunityCardComponent = ({ opportunity, onPress, hideCreator }: OpportunityCardProps) => {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const {
    _id,
    title,
    location,
    startDate,
    endDate,
    status,
    userData,
    userId,
    createdBy,
    shootType,
    reference,
  } = opportunity;

  const creator = userData || userId || (typeof createdBy === 'object' ? createdBy : null);

  // Formatting dates securely for Hermes without Intl dependencies
  const startObj = new Date(startDate);
  const endObj = new Date(endDate);
  
  const getShortDate = (d: Date) => {
    if (isNaN(d.getTime())) return "";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };
  
  const displayDate = `${getShortDate(startObj)} - ${getShortDate(endObj)}`;

  const isClosed = status !== "open";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(_id)}
      className="bg-white rounded-3xl p-4 mb-3 border border-slate-100 shadow-sm"
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 pr-3">
          <Text 
            className="font-outfit-bold text-base text-slate-900 leading-tight"
            numberOfLines={2}
          >
            {title}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {shootType && (
            <View className="px-3 py-1 rounded-full bg-[#2575FC]/10 border border-[#2575FC]/20">
              <Text className="font-outfit-medium text-[10px] text-[#2575FC] uppercase tracking-widest">
                {shootType}
              </Text>
            </View>
          )}
          <View 
            className={`px-3 py-1 rounded-full ${isClosed ? "bg-slate-100" : "bg-sky-50"}`}
          >
            <Text className={`font-outfit-medium text-[10px] ${isClosed ? "text-slate-500" : "text-sky-600"} uppercase tracking-widest`}>
              {status}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center mt-3 gap-4">
        <View className="flex-row items-center gap-1.5">
          <Calendar size={14} color="#64748B" />
          <Text className="font-outfit text-xs text-slate-600">{displayDate}</Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <MapPin size={14} color="#64748B" />
          <Text className="font-outfit text-xs text-slate-600" numberOfLines={1}>{location}</Text>
        </View>

        {reference && reference.length > 0 && (
          <View className="flex-row items-center gap-1.5 ml-auto">
            <Text className="font-outfit-medium text-xs text-slate-500">📎 {reference.length}</Text>
          </View>
        )}
      </View>

      {!hideCreator && (
      <View className="mt-4 pt-3 flex-row items-center justify-between border-t border-slate-50">
        <TouchableOpacity 
          className="flex-row items-center gap-2 flex-1"
          activeOpacity={0.8}
          onPress={(e) => {
            e.stopPropagation();
            const activeId = (user as any)?._id || (user as any)?.id;
            if (creator?._id && creator._id !== activeId) {
              router.push({ pathname: '/user/[id]' as any, params: { id: creator._id } });
            }
          }}
        >
          <View className="w-6 h-6 rounded-full bg-slate-200 items-center justify-center overflow-hidden">
            {creator?.profilePicture ? (
              <Image source={{ uri: creator.profilePicture }} className="w-full h-full bg-slate-300" />
            ) : (
              <Text className="font-outfit-medium text-[10px] text-slate-500">
                {creator?.fullName?.charAt(0) || "U"}
              </Text>
            )}
          </View>
          <Text className="font-outfit text-xs text-slate-500" numberOfLines={1}>
            Posted by <Text className="font-outfit-medium text-slate-800">{creator?.fullName || "A Creator"}</Text>
          </Text>
        </TouchableOpacity>
        
        <ChevronRight size={16} color="#CBD5E1" />
      </View>
      )}
    </TouchableOpacity>
  );
};

export const OpportunityCard = memo(OpportunityCardComponent);
