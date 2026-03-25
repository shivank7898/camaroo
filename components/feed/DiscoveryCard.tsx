import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface DiscoveryCardProps {
  id: number;
  name: string;
  role: string;
  location: string;
  isAvailable: boolean;
  image: string;
  onPress: (id: number) => void;
}

/**
 * DiscoveryCard
 * Compact vertical card used in the horizontal Discovery strip on Home.
 * Shows profile image, floating avatar, availability dot, and identity text.
 *
 * Props:
 *   id, name, role, location, isAvailable, image
 *   onPress → called with user id when card is tapped
 *
 * Functions: none (calls onPress prop)
 */
function DiscoveryCard({ id, name, role, location, isAvailable, image, onPress }: DiscoveryCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(id)}
      className="w-28 h-40 mr-4 rounded-[28px] overflow-hidden relative shadow-sm border border-black/5"
    >
      <Image source={{ uri: image }} className="w-full h-full absolute" resizeMode="cover" />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        className="w-full h-[65%] absolute bottom-0"
      />

      {/* Floating Avatar */}
      <View className="absolute top-2.5 left-2.5 w-10 h-10 rounded-full border-2 border-white overflow-hidden">
        <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
      </View>

      {/* Availability Dot */}
      {isAvailable && (
        <View className="absolute top-3 right-3 w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
      )}

      {/* Identity Text */}
      <View className="absolute bottom-4 left-3 right-3">
        <Text className="text-white font-outfit-bold text-sm tracking-tight" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-white/80 font-outfit-medium text-[10px] mt-0.5" numberOfLines={1}>
          {role} • {location}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(DiscoveryCard);
