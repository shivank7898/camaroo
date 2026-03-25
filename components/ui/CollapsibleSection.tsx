import React, { useState } from "react";
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { ChevronDown } from "lucide-react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

/**
 * CollapsibleSection
 * A flat-divider style collapsible container with LayoutAnimation.
 *
 * Functions:
 *   toggle() → triggers LayoutAnimation.easeInEaseOut + flips open state
 */
function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  /** toggle — animates the expand/collapse and flips isOpen state */
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((prev) => !prev);
  };

  return (
    <View className="px-5 mt-5">
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.7}
        className="flex-row items-center justify-between pb-3 border-b border-slate-100"
      >
        <Text className="font-outfit-bold text-sm text-black">{title}</Text>
        <View style={{ transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }}>
          <ChevronDown size={16} color="#94A3B8" />
        </View>
      </TouchableOpacity>
      {isOpen && <View className="mt-3">{children}</View>}
    </View>
  );
}

export default React.memo(CollapsibleSection);
