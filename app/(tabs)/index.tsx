import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Search, Heart, MessageCircle, MoreHorizontal, Plus, Menu } from "lucide-react-native";
import { Avatar } from "../../components/Avatar";
import { Card } from "../../components/Card";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeFeed() {
  const discoveryProfiles = [
    { id: 1, name: "Aria Laurent", role: "Portrait", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=600&fit=crop" },
    { id: 2, name: "Kenji Mori", role: "Street", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop" },
    { id: 3, name: "Sofia Reyes", role: "Nature", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop" },
    { id: 4, name: "Marcus", role: "Architecture", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop" },
  ];

  return (
    <View className="flex-1 bg-background">
      {/* Deep Blue/Purple Top Gradient seamlessly fading into Background */}
      <LinearGradient
        colors={["#5b8fbc", "#1A2b4c", "#060D1A"]}
        locations={[0, 0.4, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 350, zIndex: 0 }}
      />
      
      <SafeAreaView className="flex-1 relative">
        {/* Header */}
        <View className="px-5 py-4 flex-row justify-between items-center z-20">
          <View className="flex-row items-center gap-3">
            <Text className="text-2xl font-outfit text-white tracking-tight" style={{ marginLeft: 2 }}>Home</Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity className="min-w-[70px] h-12 px-4 bg-white rounded-full flex-row items-center justify-center gap-2 shadow-sm">
              <Bell size={20} color="#000" />
              <Text className="font-outfit-medium text-black text-base mt-0.5">3</Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm">
              <Search size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
          {/* Profile Discovery */}
          <View className="mt-8 mb-8">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5">
              {/* Profiles */}
              {discoveryProfiles.map(profile => (
                <View key={profile.id} className="w-32 h-44 mr-3 rounded-[28px] overflow-hidden relative border border-white/10">
                  <Image source={{ uri: profile.image }} className="w-full h-full absolute" resizeMode="cover" />
                  <LinearGradient colors={["transparent", "rgba(6,13,26,0.95)"]} className="w-full h-[60%] absolute bottom-0" />
                  
                  {/* Floating Avatar */}
                  <View className="absolute top-3 left-3 w-10 h-10 rounded-full border-[2.5px] border-[#7ECEFE] overflow-hidden">
                     <Image source={{ uri: profile.image }} className="w-full h-full" resizeMode="cover" />
                  </View>
                  
                  <View className="absolute bottom-4 left-3 right-3">
                    <Text className="text-white font-outfit-medium text-sm" numberOfLines={1}>{profile.name}</Text>
                    <Text className="text-secondary font-outfit-medium text-xs mt-0.5">{profile.role}</Text>
                  </View>
                </View>
              ))}
              <View className="w-6" />
            </ScrollView>
          </View>

          {/* Feed Posts */}
          <View className="px-6 gap-6">
            <FeedPost
              name="Aria Laurent"
              time="8 mins ago · Paris"
              avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop"
              postImage="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2670&auto=format&fit=crop"
              description="Golden hour over the mountain lake. Shot with a 35mm prime — sometimes you just need one lens and patience. 🏔️✨"
              likes="3.4k"
              comments="218"
            />
            <FeedPost
              name="Kenji Mori"
              time="1 hr ago · Tokyo"
              avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
              postImage="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2644&auto=format&fit=crop"
              description="Neon reflections in the rain. The city after midnight has a soul of its own. Long exposure, handheld @ f/1.8 🌧️🌃"
              likes="1.9k"
              comments="87"
            />
            <FeedPost
              name="Sofia Reyes"
              time="3 hrs ago · Mexico City"
              avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
              postImage="https://images.unsplash.com/photo-1508193638397-1c4234db14d8?q=80&w=2574&auto=format&fit=crop"
              description="Macro world — there's an entire universe hiding in the flowers of my balcony garden. 🌸🔍"
              likes="2.7k"
              comments="153"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function FeedPost({ name, time, avatar, postImage, description, likes, comments }: any) {
  return (
    <Card className="p-5">
      {/* Post Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Avatar source={{ uri: avatar }} size={48} />
          <View className="ml-3">
            <Text className="font-outfit-bold text-white text-base">{name}</Text>
            <Text className="font-outfit text-text-secondary text-xs">{time}</Text>
          </View>
        </View>
        <TouchableOpacity className="px-4 py-2 bg-secondary/20 rounded-full border border-secondary/30">
          <Text className="font-outfit-medium text-secondary text-xs">Follow</Text>
        </TouchableOpacity>
      </View>

      {/* Post Image */}
      <View className="w-full h-[300px] rounded-[28px] overflow-hidden mb-5">
        <Image source={{ uri: postImage }} className="w-full h-full" resizeMode="cover" />
      </View>

      {/* Description */}
      <Text className="font-outfit text-base leading-relaxed text-text-secondary mb-5 pl-1">
        {description}
      </Text>

      {/* Footer Actions */}
      <View className="flex-row justify-between items-center px-1">
        <View className="flex-row gap-3">
          <TouchableOpacity className="flex-row items-center px-5 py-3 border border-card-border bg-white/5 rounded-full">
            <Heart size={17} color="#D4AF37" />
            <Text className="ml-2.5 font-outfit-medium text-white text-sm">{likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center px-5 py-3 border border-card-border bg-white/5 rounded-full">
            <MessageCircle size={17} color="#FFFFFF" />
            <Text className="ml-2.5 font-outfit-medium text-white text-sm">{comments}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity className="w-12 h-12 bg-white/5 border border-card-border rounded-full items-center justify-center">
          <MoreHorizontal size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

