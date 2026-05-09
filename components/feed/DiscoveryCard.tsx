import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import DefaultProfilePicture from "@/components/ui/DefaultProfilePicture";
import { LinearGradient } from "expo-linear-gradient";

interface DiscoveryCardProps {
  id: string;
  name: string;
  role: string;
  location: string;
  isAvailable: boolean;
  image: string;
  onPress: (id: string) => void;
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
  const handlePress = React.useCallback(() => onPress(id), [id, onPress]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      className="mr-3 shadow-sm"
      style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
    >
      {image ? (
        <Image 
          source={{ uri: image }} 
          className="w-16 h-16 rounded-full border-2 border-white bg-slate-100" 
          resizeMode="cover" 
        />
      ) : (
        <View className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-slate-100">
          <DefaultProfilePicture />
        </View>
      )}
      <Text className="font-outfit-medium text-slate-800 text-[11px] text-center mt-1.5 w-16" numberOfLines={1}>{name}</Text>
    </TouchableOpacity>
  );
}

export default React.memo(DiscoveryCard);
