import { TouchableOpacity, Text, View } from "react-native";

interface SocialButtonProps {
  provider: "Google" | "Apple" | "Facebook";
  onPress: () => void;
}

export function SocialButton({ provider, onPress }: SocialButtonProps) {
  // Simple placeholders for icons until specific SVGs can be implemented. 
  // Normally we'd use react-native-svg or image assets.
  const getIconColor = () => {
    switch(provider) {
        case "Apple": return "#FFFFFF";
        case "Facebook": return "#1877F2";
        case "Google": return "#EA4335";
        default: return "#FFFFFF";
    }
  }

  return (
    <TouchableOpacity 
        activeOpacity={0.8}
        onPress={onPress}
        className="flex-row items-center justify-center p-4 rounded-xl border border-white/15 bg-white/5 mb-3"
    >
      <View className="w-5 h-5 rounded-full mr-3 items-center justify-center" style={{ backgroundColor: getIconColor() }}>
        {/* Placeholder for actual logo - using a colored dot to represent the brand for now */}
        {provider === "Apple" && <Text className="text-[10px] text-black font-outfit-bold">A</Text>}
      </View>
      <Text className="font-outfit-medium text-white text-base">Continue with {provider}</Text>
    </TouchableOpacity>
  );
}
