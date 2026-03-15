import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Camera, MapPin, Instagram, Youtube, Globe, Link2 } from "lucide-react-native";
import { Input } from "../../../components/Input";
import { useState } from "react";

export default function OnboardingDetails() {
  const router = useRouter();
  
  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#5b8fbc", "#1A2b4c", "#060D1A"]}
        locations={[0, 0.4, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center border-b border-white/5">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-white/10 mr-4">
            <ArrowLeft size={20} color="#FFF" />
          </TouchableOpacity>
          <Text className="font-outfit-bold text-white text-xl">Step 2 of 3</Text>
        </View>

        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text className="text-3xl font-outfit-bold text-white mb-2">Almost there</Text>
          <Text className="text-base font-outfit text-text-secondary mb-8">
            Tell us more about yourself to complete your creative profile.
          </Text>

          {/* Avatar Upload Placeholder */}
          <View className="items-center mb-8">
            <TouchableOpacity className="w-24 h-24 rounded-full bg-white/10 border-2 border-dashed border-white/30 items-center justify-center relative">
              <Camera size={28} color="rgba(255,255,255,0.7)" />
              <View className="absolute -bottom-2 bg-secondary px-3 py-1 rounded-full">
                <Text className="font-outfit-medium text-xs text-white">Upload</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View className="gap-5">
            <Input label="Full Name" placeholder="e.g. Jenny Wilson" />
            <Input label="Email Address" placeholder="hello@example.com" keyboardType="email-address" autoCapitalize="none" />
            <Input label="Mobile Number" placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />
            
            <View>
              <Text className="text-xs font-outfit-medium text-text-secondary mb-2 ml-1 tracking-wider uppercase">Location</Text>
              <View className="flex-row items-center bg-white/10 border border-white/15 rounded-xl px-2 py-1">
                <View className="flex-1">
                  <TextInput
                    className="px-3 py-3 font-outfit text-white text-base"
                    placeholder="Search city or zip..."
                    placeholderTextColor="rgba(148,163,184,0.6)"
                  />
                </View>
                <TouchableOpacity className="p-2 bg-white/10 rounded-lg flex-row items-center">
                  <MapPin size={16} color="#FFF" />
                  <Text className="text-white font-outfit-medium text-xs ml-1">Use GPS</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Input label="Full Address" placeholder="Enter your street address" multiline numberOfLines={2}  />

            {/* Social Links */}
            <View className="mt-4">
              <Text className="text-xs font-outfit-medium text-white mb-4 ml-1 tracking-wider uppercase">Social Links</Text>
              
              <View className="gap-3">
                <View className="flex-row items-center bg-white/10 border border-white/15 rounded-xl px-4 py-1">
                  <Instagram size={20} color="#E1306C" />
                  <TextInput className="flex-1 ml-3 py-3 font-outfit text-white text-base" placeholder="Instagram username" placeholderTextColor="rgba(148,163,184,0.6)" />
                </View>
                <View className="flex-row items-center bg-white/10 border border-white/15 rounded-xl px-4 py-1">
                  <Youtube size={20} color="#FF0000" />
                  <TextInput className="flex-1 ml-3 py-3 font-outfit text-white text-base" placeholder="YouTube channel" placeholderTextColor="rgba(148,163,184,0.6)" />
                </View>
                <View className="flex-row items-center bg-white/10 border border-white/15 rounded-xl px-4 py-1">
                  <Globe size={20} color="#3B82F6" />
                  <TextInput className="flex-1 ml-3 py-3 font-outfit text-white text-base" placeholder="Personal website URL" placeholderTextColor="rgba(148,163,184,0.6)" />
                </View>
                <View className="flex-row items-center bg-white/10 border border-white/15 rounded-xl px-4 py-1">
                  <Link2 size={20} color="#94A3B8" />
                  <TextInput className="flex-1 ml-3 py-3 font-outfit text-white text-base" placeholder="Other portfolio link" placeholderTextColor="rgba(148,163,184,0.6)" />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Bar */}
        <View className="p-6 pt-4 border-t border-white/5 bg-[#060D1A]/80">
          <TouchableOpacity 
            activeOpacity={0.85} 
            onPress={() => router.push("/(auth)/onboarding/optional")}
          >
            <LinearGradient
              colors={["#6A11CB", "#2575FC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 12, paddingVertical: 18, alignItems: "center" }}
            >
              <Text className="font-outfit-bold text-white text-lg">Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
