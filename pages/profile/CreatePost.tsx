import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, ImagePlus, Lock, Globe, PlayCircle } from "lucide-react-native";

import TopGradientFade from "@components/ui/TopGradientFade";
import { Input } from "@components/Input";
import { Button } from "@components/Button";

export default function CreatePost() {
  const router = useRouter();
  const { mediaUri, mediaType: paramMediaType } = useLocalSearchParams<{ mediaUri: string, mediaType: string }>();
  
  const [imageUri, setImageUri] = useState<string | null>(mediaUri || null);
  const [mediaType, setMediaType] = useState<string | null>(paramMediaType || null);
  const [caption, setCaption] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  // Memoized handlers for Performance Rules
  const handleCaptionChange = useCallback((text: string) => setCaption(text), []);
  const togglePrivacy = useCallback(() => setIsPublic(prev => !prev), []);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setMediaType(result.assets[0].type || 'image');
    }
  };

  const handlePublish = () => {
    if (!imageUri) return;

    setIsPublishing(true);
    // Simulate API call to createPortfolioPost mutation
    setTimeout(() => {
      setIsPublishing(false);
      router.back();
    }, 1200);
  };

  return (
    <View className="flex-1 bg-white">
      <TopGradientFade />

      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-5 py-3 flex-row items-center justify-between border-b border-black/5">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="w-11 h-11 items-center justify-center mr-1"
            >
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text className="font-outfit-bold text-xl text-black">New Post</Text>
          </View>
          <TouchableOpacity onPress={handlePublish} disabled={!imageUri || isPublishing}>
            <Text className={`font-outfit-bold text-base ${!imageUri || isPublishing ? 'text-slate-400' : 'text-[#0EA5E9]'}`}>
              {isPublishing ? "Publishing..." : "Publish"}
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <ScrollView className="flex-1 px-5 pt-6 pb-20" showsVerticalScrollIndicator={false}>
            
            {/* Image/Video Preview Area */}
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={handlePickImage}
              className={`w-full aspect-square ${!imageUri ? 'rounded-[32px] border-2 border-dashed border-slate-200 justify-center pl-6' : 'rounded-none'} bg-slate-50 overflow-hidden mb-8 relative`}
            >
              {imageUri ? (
                <>
                  <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  {mediaType === 'video' && (
                    <View className="absolute inset-0 items-center justify-center bg-black/20">
                      <PlayCircle size={48} color="#FFF" opacity={0.8} />
                    </View>
                  )}
                </>
              ) : (
                <>
                  <View className="mb-4">
                    <ImagePlus size={32} color="#0EA5E9" />
                  </View>
                  <Text className="font-outfit-bold text-xl text-slate-800">Select Media</Text>
                  <Text className="font-outfit text-sm text-slate-500 mt-1">Images or Videos</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Caption Header & Minimal Privacy Toggle */}
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-outfit-medium text-sm text-slate-500 ml-1">Caption</Text>
              
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={togglePrivacy}
                className="flex-row items-center bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5"
              >
                {isPublic ? (
                  <Globe size={12} color="#64748B" />
                ) : (
                  <Lock size={12} color="#0EA5E9" />
                )}
                <Text className={`font-outfit-medium text-xs ml-1.5 ${isPublic ? 'text-slate-500' : 'text-[#0EA5E9]'}`}>
                  {isPublic ? "Public Post" : "Private Post"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Caption Input */}
            <View className="w-full bg-slate-50 rounded-3xl border border-slate-200 px-5 py-5 min-h-[140px] mb-8">
              <Input 
                variant="light"
                placeholder="Write a caption..." 
                value={caption} 
                onChangeText={handleCaptionChange}
                multiline
                style={{ minHeight: 100, textAlignVertical: "top", padding: 0 }}
              />
            </View>

            <Button 
              title={isPublishing ? "Publishing..." : "Publish Post"} 
              onPress={handlePublish} 
              disabled={!imageUri || isPublishing} 
            />
            <View className="h-10" />

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
