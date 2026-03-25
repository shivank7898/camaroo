import React from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import { Avatar } from "../Avatar";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_HEIGHT = SCREEN_WIDTH + 80;

interface MarketplaceCardProps {
  id: string;
  name: string;
  avatar: string;
  time: string;
  location: string;
  title: string;
  price: string;
  images: string[];
  onPress?: (id: string) => void;
}

/**
 * MarketplaceCard
 * Feed card for marketplace items — shows primary image, price badge,
 * and a "View Details" CTA.
 *
 * Props:
 *   id, name, avatar, time, location, title, price, images
 *   onPress? → called with item id when tapped
 */
function MarketplaceCard({
  id, name, avatar, time, location, title, price, images, onPress,
}: MarketplaceCardProps) {
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

      <View className="flex-1">
        <View className="w-full h-48 rounded-[24px] overflow-hidden mb-4 relative">
          <Image source={{ uri: images[0] }} className="w-full h-full" resizeMode="cover" />
          <View className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
            <Text className="font-outfit-bold text-black tracking-tight">{price}</Text>
          </View>
        </View>
        
        <Text className="font-outfit-bold text-lg text-black mb-2">{title}</Text>
      </View>
      
      {/* View Details CTA */}
      <TouchableOpacity 
        className="w-full bg-[#F1F5F9] py-4 rounded-xl items-center mt-auto border border-slate-200"
        onPress={() => onPress?.(id)}
      >
        <Text className="text-slate-700 font-outfit-bold text-base">View Details</Text>
      </TouchableOpacity>
    </View>
  );
}

export default React.memo(MarketplaceCard);
