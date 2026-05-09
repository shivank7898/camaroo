import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface SocialButtonProps {
  provider: "Apple" | "Facebook";
  onPress: () => void;
}

function SocialButton({ provider, onPress }: SocialButtonProps) {
  const getIconColor = () => {
    switch (provider) {
      case "Apple": return "#FFFFFF";
      case "Facebook": return "#1877F2";
      default: return "#FFFFFF";
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="p-4 rounded-xl border border-white/15 bg-white/5 mx-2 w-14 h-14 items-center justify-center"
    >
      <View className="w-6 h-6 rounded-full items-center justify-center flex-row" style={{ backgroundColor: getIconColor() }}>
        {provider === "Apple" && <FontAwesome name="apple" size={14} color="#000000" />}
        {provider === "Facebook" && <Text className="text-[12px] text-white font-outfit-bold">f</Text>}
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(SocialButton);
export { SocialButton };
