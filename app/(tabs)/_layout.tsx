import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Home, Compass, Plus, MessageCircle, User } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

function CustomTabBar({ state, navigation }: any) {
  const activeRoute = state.routes[state.index].name;

  const navigateTo = (name: string) => {
    navigation.navigate(name);
  };

  return (
    <View className="absolute bottom-10 left-6 right-6 flex-row justify-between items-center" style={{ elevation: 0 }}>
      {/* 1. Left: Messages */}
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => navigateTo('messages')}
        className={`h-14 items-center justify-center rounded-[28px] ${activeRoute === 'messages' ? 'bg-[#1E293B] px-5 flex-row gap-2' : 'bg-[#0F1E30] w-14'}`}
      >
        <MessageCircle size={22} color="#FFFFFF" strokeWidth={activeRoute === 'messages' ? 2.5 : 2} />
        {activeRoute === 'messages' && <Text className="text-white font-outfit-medium text-sm">Chat</Text>}
      </TouchableOpacity>

      {/* Center Group: Home and Create */}
      <View className="flex-row items-center gap-3">
        {/* 2. Middle-Left: Home */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => navigateTo('index')}
          className={`h-14 items-center justify-center rounded-[28px] ${activeRoute === 'index' ? 'bg-[#1E293B] px-5 flex-row gap-2' : 'bg-[#0F1E30] w-14'}`}
        >
          <Home size={22} color="#FFFFFF" fill={activeRoute === 'index' ? "#FFFFFF" : "transparent"} strokeWidth={activeRoute === 'index' ? 2 : 2} />
          {activeRoute === 'index' && <Text className="text-white font-outfit-medium text-sm">Home</Text>}
        </TouchableOpacity>

        {/* 3. Middle-Right: Create */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigateTo('create')}
          className={`h-14 items-center justify-center rounded-[28px] ${activeRoute === 'create' ? 'bg-[#0EA5E9] px-5 flex-row gap-2' : 'bg-[#0EA5E9] w-14 shadow-lg shadow-sky-500/30'}`}
        >
          <Plus size={28} color="#FFFFFF" />
          {activeRoute === 'create' && <Text className="text-white font-outfit-medium text-sm">New</Text>}
        </TouchableOpacity>
      </View>

      {/* 4. Right: Profile */}
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => navigateTo('profile')}
        className={`h-14 items-center justify-center rounded-[28px] ${activeRoute === 'profile' ? 'bg-[#1E293B] px-5 flex-row gap-2' : 'bg-[#0F1E30] w-14'}`}
      >
        <User size={22} color="#FFFFFF" strokeWidth={activeRoute === 'profile' ? 2.5 : 2} />
        {activeRoute === 'profile' && <Text className="text-white font-outfit-medium text-sm">Profile</Text>}
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

