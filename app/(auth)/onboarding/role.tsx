import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { SelectPill } from "../../../components/SelectPill";

export default function RoleSelection() {
  const router = useRouter();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const roles = ["Photographer", "Cinematographer", "Videographer", "Editor"];

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleNext = () => {
    if (selectedRoles.length > 0) {
      router.push("/(auth)/onboarding/details");
    }
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
        <View className="px-6 py-4 flex-row items-center border-b border-white/5">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-white/10 mr-4">
            <ArrowLeft size={20} color="#FFF" />
          </TouchableOpacity>
          <Text className="font-outfit-bold text-white text-xl">How do you create?</Text>
        </View>

        <ScrollView className="flex-1 px-6 pt-8">
          <Text className="text-4xl font-outfit-bold text-white mb-2">Select your roles</Text>
          <Text className="text-base font-outfit text-text-secondary mb-10">
            You can select multiple roles. This helps us tailor your portfolio experience.
          </Text>

          <View className="gap-2">
            {roles.map((role) => (
              <SelectPill 
                key={role} 
                label={role} 
                selected={selectedRoles.includes(role)} 
                onPress={() => toggleRole(role)} 
              />
            ))}
          </View>
        </ScrollView>

        {/* Bottom Bar */}
        <View className="p-6 pt-4 border-t border-white/5 bg-[#060D1A]/80">
          <TouchableOpacity 
            activeOpacity={0.85} 
            onPress={handleNext}
            disabled={selectedRoles.length === 0}
            style={{ opacity: selectedRoles.length > 0 ? 1 : 0.5 }}
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
