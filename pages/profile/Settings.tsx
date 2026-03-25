import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, User, Calendar, Shield, LogOut, ChevronRight } from "lucide-react-native";
import TopGradientFade from "@components/ui/TopGradientFade";
import { SETTINGS_MENU } from "@constants";

// Map string keys from constant to Lucas React Native components
const renderIcon = (iconName: string) => {
  const props = { size: 22, color: "#1E293B" };
  switch (iconName) {
    case "user": return <User {...props} />;
    case "calendar": return <Calendar {...props} />;
    case "shield": return <Shield {...props} />;
    default: return <User {...props} />;
  }
};

export default function Settings() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <TopGradientFade />

      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-5 py-3 flex-row items-center border-b border-black/5">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-11 h-11 items-center justify-center mr-1"
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="font-outfit-bold text-xl text-black">Settings</Text>
        </View>

        <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
          {/* Menu Items */}
          <View className="mb-8 mt-2 border-t border-slate-200/60">
            {SETTINGS_MENU.map((item: any, index: number) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
                className={`flex-row items-center py-5 border-b border-slate-200/60`}
              >
                <View className="mr-5 ml-1">
                  {renderIcon(item.iconName)}
                </View>
                <View className="flex-1">
                  <Text className="font-outfit-bold text-base text-black mb-0.5">{item.title}</Text>
                  <Text className="font-outfit text-sm text-slate-500">{item.subtitle}</Text>
                </View>
                <ChevronRight size={20} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
          
          <Text className="text-center font-outfit text-slate-400 text-xs mt-6 mb-10">
            Camaroo App v1.0.0
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
