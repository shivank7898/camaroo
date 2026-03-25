import { View, Text, Image } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { useAuthStore } from "@store/authStore";

export default function Welcome() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isProfileCompleted = useAuthStore((s) => s.user?.isProfileCompleted);

  if (token) {
    if (isProfileCompleted) {
      return <Redirect href="/(tabs)" />;
    } else {
      return <Redirect href="/onboarding/role" />;
    }
  }

  return (
    <View className="flex-1 bg-background">
      {/* Full bleed photography background - full height for seamless blend */}
      <Image 
        source={{ uri: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80" }}
        className="absolute w-full h-full"
        resizeMode="cover"
      />

      {/* Perfect Seamless Fade Gradient */}
      <LinearGradient
        colors={["transparent", "rgba(6,13,26,0.4)", "rgba(6,13,26,0.9)", "#060D1A", "#060D1A"]}
        locations={[0, 0.4, 0.7, 0.9, 1]}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "65%" }}
      />

      {/* Top subtle vignette for status bar visibility */}
      <LinearGradient
        colors={["rgba(6,13,26,0.6)", "transparent"]}
        locations={[0, 0.2]}
        className="absolute top-0 w-full h-full"
      />

      {/* Content pinned to bottom */}
      <SafeAreaView className="flex-1 justify-end px-8 pb-12">
        {/* Brand logo mark */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-6">
            <View className="w-2 h-2 rounded-full bg-gold" />
            <Text className="font-outfit-medium text-text-secondary text-sm tracking-widest uppercase">
              Photography Community
            </Text>
          </View>
          <Text className="text-5xl font-outfit-bold text-white mb-4 leading-tight">
            Capture.{"\n"}Share.{"\n"}Inspire.
          </Text>
          <Text className="text-base font-outfit text-text-secondary leading-relaxed">
            Join thousands of photographers discovering new perspectives and building their legacy.
          </Text>
        </View>

        {/* CTA Button — purple gradient */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/(auth)/signup")}
        >
          <LinearGradient
            colors={["#6A11CB", "#2575FC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 40, paddingVertical: 18, alignItems: "center" }}
          >
            <Text className="font-outfit-bold text-white text-lg tracking-wide">
              Get Started
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text className="text-center font-outfit text-text-secondary text-sm mt-5">
          Already a member?{" "}
          <Text 
            className="text-white font-outfit-medium"
            onPress={() => router.push("/(auth)/login")}
          >
            Sign in
          </Text>
        </Text>
      </SafeAreaView>
    </View>
  );
}

