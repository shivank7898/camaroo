import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Home, Compass, Plus, MessageCircle, User, Briefcase } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@store/authStore";
import { ProtectedRoute } from "@components/auth/ProtectedRoute";
import { useRouter } from "expo-router";

import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function CustomTabBar({ state, navigation }: any) {
  const activeRoute = state.routes[state.index].name;
  const insets = useSafeAreaInsets();
  
  const navigateTo = (name: string) => {
    navigation.navigate(name);
  };

  const TAB_HEIGHT = 60;
  const BUTTON_SIZE = 64; // Bigger Home button
  const BOTTOM_PAD = Math.max(insets.bottom, 8);
  const TOTAL_HEIGHT = TAB_HEIGHT + BOTTOM_PAD;
  
  const cx = SCREEN_WIDTH / 2; // center x
  const notchW = 38; // half-width of the notch at its deepest
  const notchD = 34; // depth of the concave curve
  const curveW = 28; // wider transition curves = smoother blend into the bar

  // SVG path with wide, smooth cubic bezier curves
  const d = `
    M 0,0
    L ${cx - notchW - curveW},0
    C ${cx - notchW - 2},0  ${cx - notchW + 4},${notchD}  ${cx},${notchD}
    C ${cx + notchW - 4},${notchD}  ${cx + notchW + 2},0  ${cx + notchW + curveW},0
    L ${SCREEN_WIDTH},0
    L ${SCREEN_WIDTH},${TOTAL_HEIGHT}
    L 0,${TOTAL_HEIGHT}
    Z
  `;

  return (
    <View style={{ position: 'absolute', bottom: 0, width: '100%', height: TOTAL_HEIGHT + BUTTON_SIZE / 2 }}>
      
      {/* Frosted glass SVG background */}
      <View style={{ position: 'absolute', bottom: 0, width: '100%', height: TOTAL_HEIGHT }}>
        {/* Frost Layer 1: Solid dark base */}
        <Svg width={SCREEN_WIDTH} height={TOTAL_HEIGHT} style={StyleSheet.absoluteFill}>
          <Defs>
            <SvgGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#0B1526" stopOpacity="0.92" />
              <Stop offset="1" stopColor="#060D1A" stopOpacity="0.98" />
            </SvgGradient>
          </Defs>
          <Path d={d} fill="url(#barGrad)" />
        </Svg>
        {/* Frost Layer 2: Subtle top edge glow */}
        <Svg width={SCREEN_WIDTH} height={TOTAL_HEIGHT} style={StyleSheet.absoluteFill}>
          <Path d={d} fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="0.5" />
        </Svg>
        {/* Frost Layer 3: Inner shine for frosted look */}
        <LinearGradient
          colors={['rgba(148,163,184,0.08)', 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: TOTAL_HEIGHT / 2, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        />
      </View>

      {/* Tab Buttons Container - sits inside the bar area */}
      <View style={{ position: 'absolute', bottom: 0, width: '100%', height: TOTAL_HEIGHT, flexDirection: "row", alignItems: "center" }}>
        
        {/* Left Half: Feed */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: BOTTOM_PAD / 2 }}>
          <TouchableOpacity 
            activeOpacity={0.6} onPress={() => navigateTo('index')}
            style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 6 }}
          >
            <Compass size={22} color={activeRoute === 'index' ? "#FFFFFF" : "#64748B"} strokeWidth={activeRoute === 'index' ? 2.5 : 1.8} />
            <Text className={`text-[10px] mt-1 font-outfit-medium ${activeRoute === 'index' ? 'text-white' : 'text-slate-500'}`}>Feed</Text>
          </TouchableOpacity>
        </View>

        {/* Center Gap */}
        <View style={{ width: (notchW + curveW) * 2 }} />

        {/* Right Half: Market */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: BOTTOM_PAD / 2 }}>
          <TouchableOpacity 
            activeOpacity={0.6} onPress={() => navigateTo('market')}
            style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 6 }}
          >
            <Briefcase size={22} color={activeRoute === 'market' ? "#FFFFFF" : "#64748B"} strokeWidth={activeRoute === 'market' ? 2.5 : 1.8} />
            <Text className={`text-[10px] mt-1 font-outfit-medium ${activeRoute === 'market' ? 'text-white' : 'text-slate-500'}`}>Market</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Center Floating Home Button - bigger, with deep shadow */}
      <View style={{ 
        position: 'absolute', 
        left: cx - BUTTON_SIZE / 2, 
        top: 0, // Sits at the very top of the container, which extends above the bar
        width: BUTTON_SIZE, 
        height: BUTTON_SIZE,
      }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigateTo('dashboard')}
          style={{
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            borderRadius: BUTTON_SIZE / 2,
            backgroundColor: '#0EA5E9',
            alignItems: 'center',
            justifyContent: 'center',
            // Deep layered shadow for "lifting" effect
            shadowColor: '#0EA5E9',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.45,
            shadowRadius: 14,
            elevation: 20,
          }}
        >
          <Home size={30} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ProtectedRoute>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        {/* index.tsx = Feed (default on login) */}
        <Tabs.Screen name="index" />
        <Tabs.Screen name="dashboard" />
        <Tabs.Screen name="market" />
        {/* Hidden Tabs */}
        <Tabs.Screen name="explore" options={{ href: null }} />
        <Tabs.Screen name="create" options={{ href: null }} />
        <Tabs.Screen name="messages" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="user/[id]" options={{ href: null }} />
      </Tabs>

      {/* Global Floating Chat Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/messages' as any)}
        style={{
          position: 'absolute',
          bottom: (insets.bottom || 0) + 95, // Dynamic gap above tab bar
          right: 18,
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: '#0EA5E9',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 20,
          zIndex: 2000,
        }}
      >
        <MessageCircle size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </ProtectedRoute>
  );
}
