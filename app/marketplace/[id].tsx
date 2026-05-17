import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MessageCircle, Phone } from 'lucide-react-native';
import TopGradientFade from '@components/ui/TopGradientFade';

export default function MarketplaceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeImage, setActiveImage] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  const dummyImages = [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800&h=800",
    "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=800&h=800"
  ];

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Main Image Carousel relative bound */}
          <View className="w-full h-[400px] bg-slate-100 relative">
            {/* Embedded Native Header Inside Canvas so it scrolls out of view naturally! */}
            <View className="absolute top-4 left-0 right-0 z-20 px-5 flex-row items-center justify-between pointer-events-box-none">
              <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur items-center justify-center shadow-sm">
                <ChevronLeft size={24} color="#FFF" style={{ marginLeft: -2 }} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => setActiveImage(Math.round(e.nativeEvent.contentOffset.x / screenWidth))}
            >
              {dummyImages.map((uri, idx) => (
                <View key={idx} style={{ width: screenWidth, height: 400 }}>
                  <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                </View>
              ))}
            </ScrollView>
            
            {/* Carousel Dots */}
            {dummyImages.length > 1 && (
              <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
                {dummyImages.map((_, idx) => (
                  <View 
                    key={idx} 
                    className={`h-2 rounded-full ${idx === activeImage ? 'w-4 bg-white' : 'w-2 bg-white/50'}`} 
                  />
                ))}
              </View>
            )}
          </View>

          {/* Details Section */}
          <View className="px-5 pt-6 pb-2">
            <Text className="font-outfit-bold text-3xl text-black mb-1">Canon EOS R5</Text>
            <View className="flex-row items-center mb-6">
              <Text className="font-outfit-bold text-lg text-slate-800">₹3000/ day</Text>
              <Text className="font-outfit-medium text-base text-slate-500 mx-2">-</Text>
              <Text className="font-outfit-medium text-base text-slate-500">Mumbai</Text>
            </View>

            {/* Profile Badge */}
            <View className="flex-row items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
              <View className="flex-row items-center">
                <Image 
                  source={{ uri: "https://github.com/shadcn.png" }} 
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                />
                <View className="ml-3">
                  <Text className="font-outfit-bold text-base text-black">Anik Sharma</Text>
                  <Text className="font-outfit text-xs text-slate-500 mt-0.5">Verified Owner</Text>
                </View>
              </View>
            </View>

            {/* Specs / Meta Data */}
            <View className="flex-row flex-wrap gap-2 mb-6">
              <View className="bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200 flex-row">
                 <Text className="font-outfit-medium text-slate-800 text-xs">Condition: </Text>
                 <Text className="font-outfit text-slate-600 text-xs">Like New</Text>
              </View>
              <View className="bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200 flex-row">
                 <Text className="font-outfit-medium text-slate-800 text-xs">Category: </Text>
                 <Text className="font-outfit text-slate-600 text-xs">Camera Body</Text>
              </View>
              <View className="bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200 flex-row">
                 <Text className="font-outfit-medium text-slate-800 text-xs">MSRP: </Text>
                 <Text className="font-outfit text-slate-600 text-xs">₹250000</Text>
              </View>
            </View>

            {/* Description Details */}
            <Text className="font-outfit-bold text-lg text-slate-800 mb-2">Description</Text>
            <Text className="font-outfit text-base text-slate-600 leading-relaxed">
              Mint condition Canon EOS R5 available for rent. Perfect for professional photography and high-end video production. Comes with 2 spare batteries and a 128GB CFexpress card. Hand delivery available anywhere in Mumbai for extended rentals.
            </Text>
          </View>
        </ScrollView>

        {/* Footer actions completely pinned outside Scrollable context */}
        <View className="px-5 py-4 bg-white border-t border-slate-100">
           <TouchableOpacity className="bg-sky-500 rounded-xl py-4 flex-row items-center justify-center shadow-md shadow-sky-500/30">
              <MessageCircle size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text className="font-outfit-bold text-white text-base">Chat Owner</Text>
           </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}
