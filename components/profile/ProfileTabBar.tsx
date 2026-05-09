import React, { memo } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";

export type ProfileTabSpec = "portfolio" | "opportunities";

interface ProfileTabBarProps {
  activeTab: ProfileTabSpec;
  onTabChange: (tab: ProfileTabSpec) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ProfileTabBarComponent = ({ activeTab, onTabChange }: ProfileTabBarProps) => {
  return (
    <View className="flex-row items-center justify-between border-b border-slate-100" style={{ width: SCREEN_WIDTH }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onTabChange("portfolio")}
        style={{ flex: 1, paddingVertical: 14, alignItems: "center" }}
      >
        <Text className={`font-outfit-medium ${activeTab === "portfolio" ? "text-slate-900" : "text-slate-400"}`}>
          Portfolio
        </Text>
        {activeTab === "portfolio" && (
          <View className="absolute bottom-[-1px] w-12 h-0.5 bg-slate-900 rounded-t-full" />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onTabChange("opportunities")}
        style={{ flex: 1, paddingVertical: 14, alignItems: "center" }}
      >
        <Text className={`font-outfit-medium ${activeTab === "opportunities" ? "text-slate-900" : "text-slate-400"}`}>
          Opportunities
        </Text>
        {activeTab === "opportunities" && (
          <View className="absolute bottom-[-1px] w-20 h-0.5 bg-slate-900 rounded-t-full" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export const ProfileTabBar = memo(ProfileTabBarComponent);
