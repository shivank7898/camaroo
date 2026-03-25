import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Home, Compass, Plus, MessageCircle, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@store/authStore";
import { ProtectedRoute } from "@components/auth/ProtectedRoute";

function CustomTabBar({ state, navigation }: any) {
  const activeRoute = state.routes[state.index].name;
  const insets = useSafeAreaInsets();

  const navigateTo = (name: string) => {
    navigation.navigate(name);
  };

  return (
    <View
      style={{
        backgroundColor: "rgba(6, 13, 26, 0.80)",
        paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        paddingTop: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        elevation: 0,
      }}
    >
      {/* Glass rim — subtle gradient strip along the top */}
      <LinearGradient
        colors={["rgba(91,143,188,0.35)", "rgba(91,143,188,0)"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5 }}
      />
      <TouchableOpacity 
        activeOpacity={0.6} onPress={() => navigateTo('index')}
        className="items-center justify-center w-14"
      >
        <Home size={24} color={activeRoute === 'index' ? "#FFFFFF" : "#64748B"} strokeWidth={activeRoute === 'index' ? 2.5 : 2} />
        <Text className={`text-[10px] mt-1 font-outfit-medium ${activeRoute === 'index' ? 'text-white' : 'text-slate-500'}`}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        activeOpacity={0.6} onPress={() => navigateTo('explore')}
        className="items-center justify-center w-14"
      >
        <Compass size={24} color={activeRoute === 'explore' ? "#FFFFFF" : "#64748B"} strokeWidth={activeRoute === 'explore' ? 2.5 : 2} />
        <Text className={`text-[10px] mt-1 font-outfit-medium ${activeRoute === 'explore' ? 'text-white' : 'text-slate-500'}`}>Explore</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigateTo('create')}
        className="w-12 h-12 mb-2 rounded-full bg-[#0EA5E9] items-center justify-center"
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity 
        activeOpacity={0.6} onPress={() => navigateTo('messages')}
        className="items-center justify-center w-14"
      >
        <MessageCircle size={24} color={activeRoute === 'messages' ? "#FFFFFF" : "#64748B"} strokeWidth={activeRoute === 'messages' ? 2.5 : 2} />
        <Text className={`text-[10px] mt-1 font-outfit-medium ${activeRoute === 'messages' ? 'text-white' : 'text-slate-500'}`}>Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        activeOpacity={0.6} onPress={() => navigateTo('profile')}
        className="items-center justify-center w-14"
      >
        <User size={24} color={activeRoute === 'profile' ? "#FFFFFF" : "#64748B"} strokeWidth={activeRoute === 'profile' ? 2.5 : 2} />
        <Text className={`text-[10px] mt-1 font-outfit-medium ${activeRoute === 'profile' ? 'text-white' : 'text-slate-500'}`}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  return (
    <ProtectedRoute>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="explore" />
        <Tabs.Screen name="create" />
        <Tabs.Screen name="messages" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="user/[id]" options={{ href: null }} />
      </Tabs>
    </ProtectedRoute>
  );
}
