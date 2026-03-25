import React, { useState } from "react";
import { View, Text, Switch, TouchableOpacity, Image, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { Input } from "@components/Input";
import { usePortfolioUpload } from "@hooks/usePortfolioUpload";
import { Loader } from "@components/ui/Loader";

const AVAILABLE_TAGS = ["Wedding", "Portrait", "Fashion", "Commercial", "Event", "Product", "Nature"];

export default function CreatePostScreen() {
  const router = useRouter();
  const { mediaUri, mediaType } = useLocalSearchParams<{ mediaUri: string; mediaType: string }>();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { startUpload } = usePortfolioUpload();

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handlePost = async () => {
    if (!mediaUri || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const isVideo = mediaType === 'video';
      const safeMediaType = isVideo ? 'video' : 'photo';
      const mimeType = isVideo ? 'video/mp4' : 'image/jpeg';
      
      await startUpload({
        fileUri: mediaUri,
        mediaType: safeMediaType,
        mimeType,
        title: title.trim(),
        description: description.trim(),
        tags: selectedTags,
        visibility: isPublic ? "public" : "private",
      });

      router.back();
    } catch (error) {
      console.error("Post creation failed:", error);
      setIsSubmitting(false);
    }
  };

  const isFormValid = title.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-[#060D1A]" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between border-b border-white/10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2" disabled={isSubmitting}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text className="font-outfit-bold text-white text-lg">New Post</Text>
        <TouchableOpacity onPress={handlePost} disabled={!isFormValid || isSubmitting}>
          {isSubmitting ? (
            <Loader />
          ) : (
            <Text className={`font-outfit-bold text-lg ${isFormValid ? "text-[#0EA5E9]" : "text-white/30"}`}>
              Post
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        {/* Media Preview */}
        <View className="items-center mb-6">
          {mediaUri ? (
            <Image 
              source={{ uri: mediaUri }} 
              className="w-40 h-40 rounded-xl bg-white/10"
              resizeMode="cover"
            />
          ) : (
            <View className="w-40 h-40 rounded-xl bg-white/10 items-center justify-center">
              <Text className="text-white/50 font-outfit">No Media</Text>
            </View>
          )}
        </View>

        {/* Form Fields */}
        <Input 
          label="Title"
          placeholder="Give your post a title..."
          value={title}
          onChangeText={setTitle}
          editable={!isSubmitting}
          className="mb-4"
        />

        <Input 
          label="Description (Optional)"
          placeholder="Write a caption..."
          value={description}
          onChangeText={setDescription}
          editable={!isSubmitting}
          multiline
          numberOfLines={3}
          className="mb-6"
        />

        {/* Tags */}
        <Text className="text-xs font-outfit-medium text-text-secondary mb-3 ml-1 tracking-wider uppercase">Tags</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {AVAILABLE_TAGS.map(tag => (
            <TouchableOpacity
              key={tag}
              activeOpacity={0.8}
              onPress={() => toggleTag(tag)}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-full border ${
                selectedTags.includes(tag)
                  ? "bg-secondary/20 border-secondary"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <Text className={`font-outfit-medium text-sm ${
                selectedTags.includes(tag) ? "text-white" : "text-text-secondary"
              }`}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Visibility */}
        <View className="flex-row items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 mt-2">
          <View>
            <Text className="font-outfit-bold text-white text-base">Make Public</Text>
            <Text className="font-outfit text-white/50 text-xs mt-1">Anyone can see this post</Text>
          </View>
          <Switch 
            value={isPublic} 
            onValueChange={setIsPublic} 
            disabled={isSubmitting}
            trackColor={{ false: "#334155", true: "#0EA5E9" }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
