import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../components/Input";
import { SocialButton } from "../../components/SocialButton";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";

export default function SignupScreen() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");

  // Animations
  const slideAnimRight1 = useRef(new Animated.Value(50)).current; 
  const slideAnimLeft1 = useRef(new Animated.Value(-50)).current; 
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  
  const btnSlideAnim = useRef(new Animated.Value(50)).current; 
  const btnFadeAnim = useRef(new Animated.Value(0)).current; 

  // Glare Animation
  const glareAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnimRight1, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnimLeft1, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(btnSlideAnim, { toValue: 0, duration: 800, delay: 200, useNativeDriver: true }),
      Animated.timing(btnFadeAnim, { toValue: 1, duration: 800, delay: 200, useNativeDriver: true }),
    ]).start(() => {
        // Trigger Glare Shimmer after entrance is finished
        Animated.timing(glareAnim, { toValue: 600, duration: 800, useNativeDriver: true }).start();
    });
  }, []);

  const handleSignup = () => {
    router.push("/(auth)/onboarding/role");
  };

  return (
    <View className="flex-1 bg-background">
      {/* Shared Deep Blue/Purple Top Gradient matching HomeScreen */}
      <LinearGradient
        colors={["#5b8fbc", "#1A2b4c", "#060D1A"]}
        locations={[0, 0.4, 1]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", zIndex: 0 }}
      />

      <SafeAreaView className="flex-1">
        {/* Back button */}
        <TouchableOpacity
          className="mt-4 ml-6 self-start p-3 rounded-full bg-white/10 border border-white/20"
          onPress={() => router.back()}
          style={{ zIndex: 20 }}
        >
          <ArrowLeft size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Form content */}
        <View className="flex-1 px-6 pt-12 pb-10">
          <View className="p-8 rounded-2xl border border-white/20 bg-white/5 shadow-2xl relative overflow-hidden">
             
            {/* Animated One-Time Sheen Glare */}
            <Animated.View 
                style={{ 
                    position: 'absolute', 
                    top: -100, 
                    left: 0, 
                    bottom: -100, 
                    width: '150%', 
                    transform: [{ translateX: glareAnim }, { rotate: '45deg' }],
                    zIndex: 10,
                    pointerEvents: 'none'
                }}>
                <LinearGradient
                  colors={["transparent", "rgba(255,255,255,0.02)", "rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)", "transparent"]}
                  locations={[0, 0.3, 0.5, 0.7, 1]}
                  style={{ width: '100%', height: '100%' }}
                />
            </Animated.View>

            <View className="mb-8">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-1.5 h-1.5 bg-gold" />
                <Text className="font-outfit-medium text-text-secondary text-xs tracking-widest uppercase">
                  Join the Community
                </Text>
              </View>
              <Text className="text-4xl font-outfit-bold text-white mb-2">Create Account</Text>
              <Text className="text-base font-outfit text-text-secondary">
                Start sharing your lens with the world.
              </Text>
            </View>

            {/* Auth Method Tabs */}
            <View className="flex-row bg-white/10 rounded-2xl p-1 mb-8">
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => setAuthMethod("email")}
                className={`flex-1 py-3 items-center rounded-xl ${authMethod === "email" ? "bg-white/20" : ""}`}
              >
                <Text className={`font-outfit-medium text-sm ${authMethod === "email" ? "text-white" : "text-text-secondary"}`}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => setAuthMethod("phone")}
                className={`flex-1 py-3 items-center rounded-xl ${authMethod === "phone" ? "bg-white/20" : ""}`}
              >
                <Text className={`font-outfit-medium text-sm ${authMethod === "phone" ? "text-white" : "text-text-secondary"}`}>Phone</Text>
              </TouchableOpacity>
            </View>

            <Animated.View style={{ transform: [{ translateX: slideAnimLeft1 }], opacity: fadeAnim }} className="gap-4 mb-6">
              {authMethod === "email" ? (
                <>
                  <Input label="Email Address" placeholder="hello@example.com" keyboardType="email-address" autoCapitalize="none" />
                  <Input label="Password" placeholder="••••••••" secureTextEntry />
                </>
              ) : (
                <>
                  <Input label="Mobile Number" placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />
                  <Input label="OTP" placeholder="Enter 6-digit code" keyboardType="number-pad" />
                </>
              )}
            </Animated.View>

            <Animated.View style={{ transform: [{ translateY: btnSlideAnim }], opacity: btnFadeAnim }}>
              <TouchableOpacity activeOpacity={0.85} onPress={handleSignup}>
                <LinearGradient
                  colors={["#6A11CB", "#2575FC"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 12, paddingVertical: 18, alignItems: "center", marginBottom: 20 }}
                >
                  <Text className="font-outfit-bold text-white text-lg">Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <View className="flex-row items-center justify-center my-4">
                <View className="flex-1 h-[1px] bg-white/10" />
                <Text className="text-text-secondary font-outfit-medium mx-4">or</Text>
                <View className="flex-1 h-[1px] bg-white/10" />
              </View>

              <SocialButton provider="Google" onPress={() => console.log('google')} />
              <SocialButton provider="Apple" onPress={() => console.log('apple')} />
            </Animated.View>

            <Animated.View style={{ transform: [{ translateY: btnSlideAnim }], opacity: btnFadeAnim }} className="flex-row items-center justify-center mt-2">
              <Text className="font-outfit text-text-secondary text-base">Already shooting with us? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="font-outfit-bold text-white text-base">Sign In</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

