import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { MapPin, MoreVertical } from "lucide-react-native";

export interface MarketplaceItemCardProps {
  id: string;
  title: string;
  price: string;
  location: string;
  thumbnail: string;
  onPress: (id: string) => void;
  onOptionsPress?: (id: string) => void;
  style?: any;
}

export default function MarketplaceItemCard({
  id,
  title,
  price,
  location,
  thumbnail,
  onPress,
  onOptionsPress,
  style,
}: MarketplaceItemCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(id)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative"
      style={[
        {
          width: "48%",
          marginBottom: 16,
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 2,
        },
        style
      ]}
    >
      <View className="w-full h-36 bg-slate-100 relative">
        <Image
          source={{ uri: thumbnail || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400&h=300" }}
          className="w-full h-full"
          resizeMode="cover"
        />
        {onOptionsPress && (
          <TouchableOpacity 
            onPress={() => onOptionsPress(id)}
            hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
            className="absolute top-2 right-2 flex items-center justify-center bg-white/95 rounded-full w-8 h-8 z-10 shadow-sm"
          >
             <MoreVertical size={18} color="#333" />
          </TouchableOpacity>
        )}
      </View>

      <View className="p-3">
        <Text className="font-outfit-bold text-[15px] text-slate-800" numberOfLines={1}>
          {title}
        </Text>
        <Text className="font-outfit-medium text-sm text-sky-600 mt-1" numberOfLines={1}>
          {price}
        </Text>

        <View className="flex-row items-center justify-end mt-2">
          <View className="flex-row items-center">
            <MapPin size={10} color="#64748B" />
            <Text className="font-outfit text-[11px] text-slate-500 ml-0.5" numberOfLines={1}>
              {location}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
