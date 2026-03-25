import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from "react-native";
import { Avatar } from "../Avatar";
import { BadgeCheck } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_HEIGHT = SCREEN_WIDTH + 80;

interface PortfolioFeedCardProps {
  id: string;
  name: string;
  avatar: string;
  time: string;
  location: string;
  images: string[];
  tag: string;
  description: string;
  onUserPress?: (id: string) => void;
}

/**
 * PortfolioFeedCard
 * Feed card for portfolio posts — image carousel with pagination dots,
 * post header, tag pill, and description.
 *
 * Props:
 *   id, name, avatar, time, location, images, tag, description
 *   onUserPress? → called with user id when name/avatar tapped
 *
 * Functions:
 *   handleImageScroll(x) → computes active dot index from scroll offset
 */
function PortfolioFeedCard({
  id, name, avatar, time, location, images, tag, description, onUserPress,
}: PortfolioFeedCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  /** handleImageScroll — tracks which image is active for dot indicator */
  const handleImageScroll = useCallback((x: number) => {
    const index = Math.round(x / SCREEN_WIDTH);
    setActiveIndex(index);
  }, []);

  return (
    <View className="bg-white mb-2 border-b border-black/5" style={{ minHeight: CARD_HEIGHT }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => onUserPress?.(id)}
          activeOpacity={0.8}
        >
          <Avatar source={{ uri: avatar }} size={48} />
          <View className="ml-3">
            <View className="flex-row items-center">
              <Text className="font-outfit-bold text-black text-base">{name}</Text>
              <BadgeCheck size={14} fill="#0EA5E9" color="#FFF" className="ml-1" />
            </View>
            <Text className="font-outfit text-[#6B7280] text-xs mt-0.5">
              {time} • {location}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity className="px-3 py-1.5 rounded-full border border-black/10 bg-slate-50">
          <Text className="font-outfit-medium text-slate-700 text-[11px] uppercase tracking-wider">
            {tag}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Full Width Square Image Carousel */}
      <View style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }} className="relative bg-black">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => handleImageScroll(e.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
        >
          {images.map((img, idx) => (
            <Image
              key={idx}
              source={{ uri: img }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
        {/* Pagination Dots */}
        {images.length > 1 && (
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5">
            {images.map((_, idx) => (
              <View
                key={idx}
                className={`h-2 rounded-full ${
                  activeIndex === idx ? "w-4 bg-[#0EA5E9]" : "w-2 bg-white/60"
                }`}
              />
            ))}
          </View>
        )}
      </View>

      {/* Description */}
      <View className="px-5 py-4">
        <Text className="font-outfit text-sm leading-relaxed text-slate-800">{description}</Text>
      </View>
    </View>
  );
}

export default React.memo(PortfolioFeedCard);
