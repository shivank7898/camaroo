import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Search, Heart, MessageCircle, MoreVertical, Plus, Menu, Globe2, BadgeCheck } from "lucide-react-native";
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
    <View className="flex-1 bg-white">
      {/* Simple Top Blue fade as per reference image */}
      <LinearGradient
        colors={["#5b8fbc", "rgba(26,43,76,0.3)", "rgba(255,255,255,0)"]}
        locations={[0, 0.6, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160, zIndex: 0 }}
      />
      
      <SafeAreaView className="flex-1 relative">
        {/* Header */}
        <View className="px-5 py-4 flex-row justify-between items-center z-20">
          <View className="flex-row items-center gap-3 mt-2">
            <Text className="text-3xl font-outfit-bold text-black tracking-tight" style={{ marginLeft: 2 }}>Home</Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm border border-black/5">
              <Bell size={22} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm border border-black/5">
              <Search size={22} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
          {/* Profile Discovery */}
          <View className="mt-4 mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5">
              {/* Profiles - Removing from white/gray card */}
              {discoveryProfiles.map(profile => (
                <View key={profile.id} className="w-24 h-32 mr-3 rounded-[24px] overflow-hidden relative shadow-sm border border-white/20">
                  <Image source={{ uri: profile.image }} className="w-full h-full absolute" resizeMode="cover" />
                  <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} className="w-full h-[50%] absolute bottom-0" />
                  
                  {/* Floating Avatar */}
                  <View className="absolute top-2 left-2 w-8 h-8 rounded-full border-[1.5px] border-white overflow-hidden">
                     <Image source={{ uri: profile.image }} className="w-full h-full" resizeMode="cover" />
                  </View>
                  
                  <View className="absolute bottom-3 left-2 right-2">
                    <Text className="text-white font-outfit-medium text-xs" numberOfLines={1}>{profile.name}</Text>
                  </View>
                </View>
              ))}
              <View className="w-6" />
            </ScrollView>
          </View>

          {/* Feed Posts */}
          <View>
            <FeedPost
              name="Jenny Wilson"
              time="3 mins ago"
              location="California"
              avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop"
              images={[
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&fit=crop",
                  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&fit=crop",
                  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&fit=crop"
              ]}
              tag="Brother"
              description="Simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
              likes="2.1k"
              comments="2.1k"
            />
            <FeedPost
              name="Kenji Mori"
              time="1 hr ago"
              location="Tokyo"
              avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
              images={[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&fit=crop",
                  "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800&fit=crop",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&fit=crop"
              ]}
              tag="Portrait"
              description="Urban exploration in the heart of the city. The lights at night are truly something else entirely."
              likes="1.9k"
              comments="87"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function FeedPost({ name, time, location, avatar, images, description, tag }: any) {
  const [focusedImage, setFocusedImage] = React.useState<number>(2); // Center image focused by default

  return (
    <View className="bg-white px-5 py-6 mb-2">
      {/* Post Header - Removed the gray background (bg-[#f0f2f5]) and border from the tag to match screenshot */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <Avatar source={{ uri: avatar }} size={52} />
          <View className="ml-3">
            <View className="flex-row items-center">
              <Text className="font-outfit-bold text-black text-lg">{name}</Text>
              <BadgeCheck size={16} fill="#0EA5E9" color="#FFF" className="ml-1" />
            </View>
            <View className="flex-row items-center mt-0.5">
              <Text className="font-outfit text-[#6B7280] text-sm">{time} . {location} . </Text>
              <Globe2 size={12} color="#6B7280" />
            </View>
          </View>
        </View>
        <TouchableOpacity className="px-5 py-2.5 rounded-full border border-black/5">
          <Text className="font-outfit-medium text-black text-sm">{tag}</Text>
        </TouchableOpacity>
      </View>

      {/* 3 Stacked Tilted Images Layout with Touch to Focus and Padding */}
      <View className="w-full h-[320px] items-center justify-center relative mb-6 px-4">
        {/* Left Back Image */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => setFocusedImage(0)}
          className={`absolute left-4 w-[55%] h-[240px] rounded-[32px] overflow-hidden ${focusedImage === 0 ? 'border-4 border-white shadow-xl' : ''}`}
          style={{ 
            transform: [{ rotate: focusedImage === 0 ? '0deg' : '-8deg' }, { translateX: focusedImage === 0 ? 30 : -10 }, { scale: focusedImage === 0 ? 1.1 : 1 }],
            zIndex: focusedImage === 0 ? 30 : 10 
          }}
        >
          {images && images.length > 0 && <Image source={{ uri: images[0] }} className="w-full h-full" resizeMode="cover" />}
        </TouchableOpacity>
        
        {/* Right Back Image */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => setFocusedImage(1)}
          className={`absolute right-4 w-[55%] h-[240px] rounded-[32px] overflow-hidden ${focusedImage === 1 ? 'border-4 border-white shadow-xl' : ''}`}
          style={{ 
            transform: [{ rotate: focusedImage === 1 ? '0deg' : '8deg' }, { translateX: focusedImage === 1 ? -30 : 10 }, { scale: focusedImage === 1 ? 1.1 : 1 }],
            zIndex: focusedImage === 1 ? 30 : 10 
          }}
        >
          {images && images.length > 1 && <Image source={{ uri: images[1] }} className="w-full h-full" resizeMode="cover" />}
        </TouchableOpacity>
        
        {/* Main Center Image */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => setFocusedImage(2)}
          className={`absolute w-[58%] h-[280px] rounded-[36px] overflow-hidden ${focusedImage === 2 ? 'border-4 border-white shadow-xl' : ''}`}
          style={{ 
            zIndex: focusedImage === 2 ? 30 : 20,
            transform: [{ scale: focusedImage === 2 ? 1 : 0.95 }]
          }}
        >
          {images && images.length > 2 && <Image source={{ uri: images[2] }} className="w-full h-full" resizeMode="cover" />}
        </TouchableOpacity>
      </View>

      {/* Description - Removing Likes and Comments as requested */}
      <Text className="font-outfit text-base leading-relaxed text-black">
        {description}
      </Text>
    </View>
  );
}

