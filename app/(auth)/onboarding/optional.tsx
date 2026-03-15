import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, ChevronDown } from "lucide-react-native";
import { Input } from "../../../components/Input";
import { useState } from "react";

export default function OnboardingOptional() {
  const router = useRouter();
  const [experience, setExperience] = useState("");
  
  const handleFinalize = () => {
    // Navigate to Home Feed
    router.replace("/(tabs)");
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#5b8fbc", "#1A2b4c", "#060D1A"]}
        locations={[0, 0.4, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center border-b border-white/5 justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-white/10 mr-4">
              <ArrowLeft size={20} color="#FFF" />
            </TouchableOpacity>
            <Text className="font-outfit-bold text-white text-xl">Final Step</Text>
          </View>
          <TouchableOpacity onPress={handleFinalize}>
            <Text className="font-outfit-medium text-white/50 text-base">Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 pt-8">
          <Text className="text-3xl font-outfit-bold text-white mb-2">Optional Info</Text>
          <Text className="text-base font-outfit text-text-secondary mb-10">
            Tell us about your professional background to help clients find you faster. (You can skip this for now).
          </Text>

          <View className="gap-6">
            <View>
              <Text className="text-xs font-outfit-medium text-text-secondary mb-2 ml-1 tracking-wider uppercase">Years of Experience</Text>
              <View className="flex-row items-center bg-white/10 border border-white/15 rounded-xl px-2 py-1">
                <TextInput
                  className="flex-1 px-3 py-3 font-outfit text-white text-base"
                  placeholder="e.g. 5"
                  keyboardType="numeric"
                  placeholderTextColor="rgba(148,163,184,0.6)"
                  value={experience}
                  onChangeText={setExperience}
                />
                <Text className="text-white/40 font-outfit mr-3">Years</Text>
              </View>
            </View>

            <View>
              <Text className="text-xs font-outfit-medium text-text-secondary mb-2 ml-1 tracking-wider uppercase">Specialization</Text>
              <TouchableOpacity className="flex-row items-center justify-between bg-white/10 border border-white/15 rounded-xl px-5 py-4">
                <Text className="font-outfit text-white/60 text-base">Select specialized niches...</Text>
                <ChevronDown size={20} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
              <View className="flex-row flex-wrap mt-3 gap-2">
                 <View className="bg-white/5 border border-white/10 rounded-full px-4 py-2">
                    <Text className="text-white font-outfit text-sm">Wedding</Text>
                 </View>
                 <View className="bg-white/5 border border-white/10 rounded-full px-4 py-2">
                    <Text className="text-white font-outfit text-sm">Fashion</Text>
                 </View>
                 <View className="bg-white/5 border border-white/10 rounded-full px-4 py-2">
                    <Text className="text-white font-outfit text-sm">Commercial</Text>
                 </View>
                 <View className="bg-white/5 border border-white/10 rounded-full px-4 py-2">
                    <Text className="text-white font-outfit text-sm">+ Add Custom</Text>
                 </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Bar */}
        <View className="p-6 pt-4 border-t border-white/5 bg-[#060D1A]/80">
          <TouchableOpacity 
            activeOpacity={0.85} 
            onPress={handleFinalize}
          >
            <LinearGradient
              colors={["#6A11CB", "#2575FC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 12, paddingVertical: 18, alignItems: "center" }}
            >
              <Text className="font-outfit-bold text-white text-lg">Complete Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
