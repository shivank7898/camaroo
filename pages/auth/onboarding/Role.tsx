import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { useState, useEffect, useCallback } from "react";
import { BackHandler } from "react-native";
import { SelectPill } from "@components/SelectPill";
import { useAuthStore } from "@store/authStore";
import { useUserStore } from "@store/userStore";

export default function RoleSelection() {
  const router = useRouter();
  const setOnboardingData = useAuthStore((s) => s.setOnboardingData);
  const logout = useAuthStore((s) => s.logout);
  const clearUser = useUserStore((s) => s.clearUser);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const handleBack = useCallback(() => {
    logout();
    clearUser();
    router.replace("/(auth)/login");
  }, [logout, clearUser, router]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleBack();
      return true; // Prevent default pop
    });
    return () => sub.remove();
  }, [handleBack]);

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
      setOnboardingData({ role: selectedRoles });
      router.push("/onboarding/details");
    }
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#5b8fbc", "#1A2b4c", "#060D1A"]}
        locations={[0, 0.4, 1]}
        style={styles.fullOverlay}
      />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center border-b border-white/5">
          <TouchableOpacity onPress={handleBack} className="w-10 h-10 items-center justify-center rounded-full bg-white/10 mr-4">
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
            style={selectedRoles.length > 0 ? styles.btnEnabled : styles.btnDisabled}
          >
            <LinearGradient
              colors={["#6A11CB", "#2575FC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              <Text className="font-outfit-bold text-white text-lg">Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  btnEnabled: {
    opacity: 1,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
});
