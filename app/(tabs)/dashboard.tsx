import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Camera, Search, HelpCircle, FileText, Calendar, BookOpen, Receipt, Bell } from "lucide-react-native";
import { useAuthStore } from "@store/authStore";
import { useUserStore } from "@store/userStore";
import TopGradientFade from "@components/ui/TopGradientFade";
import { LinearGradient } from "expo-linear-gradient";

export default function DashboardScreen() {
  const router = useRouter();
  const { userData } = useUserStore();
  const profile = userData?.user;

  console.log("[Dashboard Topbar] Target Profile Pic URL:", profile?.profilePicture);

  const ActionButton = ({ icon: Icon, label, onPress, primary = false }: any) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`mb-3 border ${primary ? 'border-sky-400/50 shadow-md' : 'border-slate-200/60 shadow-sm'}`}
      style={{ width: "31%", aspectRatio: 1, borderRadius: 22, overflow: "hidden" }}
    >
      <LinearGradient 
        colors={primary ? ["#38BDF8", "#0284C7"] : ["#F8FAFC", "#F1F5F9"]} 
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
        <View className={`w-10 h-10 rounded-[14px] items-center justify-center mb-1.5 ${primary ? 'bg-white/20' : 'bg-white/60 shadow-sm'}`}>
          <Icon color={primary ? "#FFFFFF" : "#475569"} size={20} strokeWidth={2.2} />
        </View>
        <Text 
          className={`font-outfit-bold text-[11px] text-center w-full ${primary ? "text-white" : "text-slate-600"}`} 
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const GlassSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View
      className="mx-4 mt-5 rounded-[28px]"
      style={{
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.3)',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
      }}
    >
      <LinearGradient
        colors={['rgba(148,163,184,0.08)', 'rgba(148,163,184,0.03)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ padding: 22, borderRadius: 28 }}
      >
        <Text className="font-outfit-bold text-[17px] text-slate-800 mb-2 ml-1">{title}</Text>
        <View className="flex-row flex-wrap justify-between gap-y-4 bg-transparent">
          {children}
        </View>
      </LinearGradient>
    </View>
  );

  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      <TopGradientFade />

      <SafeAreaView className="flex-1 relative" edges={['top']}>
        {/* Header: Search → Bell → Profile (rightmost) */}
        <View className="px-5 py-4 flex-row justify-between items-center z-20">
          <View className="flex-row items-center gap-3 mt-2">
            <Text className="text-3xl font-outfit-bold text-black tracking-tight">Dashboard</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-sm border border-black/5">
              <Search size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-sm border border-black/5">
              <Bell size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
            >
              <Image
                source={{ uri: profile?.profilePicture || "https://github.com/shadcn.png" }}
                className="w-11 h-11 rounded-full border-2 border-white shadow-sm"
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: (insets.bottom || 0) + 120 }} showsVerticalScrollIndicator={false}>

          {/* Gears Section */}
          <GlassSection title="Gears">
            <ActionButton icon={Camera} label="New Product" />
            <ActionButton icon={Camera} label="Used" />
            <ActionButton icon={Camera} label="New" primary onPress={() => router.push('/market')} />
          </GlassSection>

          {/* Advanced Search Section */}
          <GlassSection title="Advanced Search">
            <ActionButton icon={Search} label="Adv. Search" />
            <ActionButton icon={FileText} label="Req." onPress={() => router.push('/opportunities')} />
            <ActionButton icon={HelpCircle} label="Help?" />
          </GlassSection>

          {/* Personal Section */}
          <GlassSection title="Personal">
            <ActionButton icon={FileText} label="Quot." />
            <ActionButton icon={Receipt} label="Bill" />
            <ActionButton
              icon={Calendar}
              label="Calendar"
              onPress={() => router.push('/settings/availability')}
            />
            <ActionButton icon={BookOpen} label="Course" />
          </GlassSection>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
