import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

export type AuthMethod = "email" | "phone";

interface AuthTabsProps {
  method: AuthMethod;
  onChange: (method: AuthMethod) => void;
}

export function AuthTabs({ method, onChange }: AuthTabsProps) {
  return (
    <View className="flex-row bg-white/10 rounded-2xl p-1 mb-8">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onChange("email")}
        className={`flex-1 py-3 items-center rounded-xl ${method === "email" ? "bg-white/20" : ""}`}
      >
        <Text className={`font-outfit-medium text-sm ${method === "email" ? "text-white" : "text-text-secondary"}`}>
          Email
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onChange("phone")}
        className={`flex-1 py-3 items-center rounded-xl ${method === "phone" ? "bg-white/20" : ""}`}
      >
        <Text className={`font-outfit-medium text-sm ${method === "phone" ? "text-white" : "text-text-secondary"}`}>
          Phone
        </Text>
      </TouchableOpacity>
    </View>
  );
}
