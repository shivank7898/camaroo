import React, { useState, useEffect } from "react";
import { View, Text, Switch, TouchableOpacity, Image, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { Input } from "@components/Input";
import { Loader } from "@components/ui/Loader";
import Toast from 'react-native-toast-message';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePortfolioMutation } from "@services/mutations";
import type { PortfolioPost, PaginatedPortfolioResponse } from "@/types/portfolio";
import type { ApiResponse } from "@/types/auth";

const AVAILABLE_TAGS = ["Wedding", "Portrait", "Fashion", "Commercial", "Event", "Product", "Nature"];

function EditVideoPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });
  return (
    <VideoView
      player={player}
      style={{ width: "100%", height: 256, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)" }}
      contentFit="cover"
    />
  );
}

export default function EditPostScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const queryClient = useQueryClient();

  // Load post from cache
  const portfolioData = queryClient.getQueryData<PaginatedPortfolioResponse>(["my-portfolio"]);
  const post = portfolioData?.data?.find(p => p._id === postId);

  useEffect(() => {
    if (!post) {
      Toast.show({ type: 'error', text1: 'Post Not Found', text2: 'This post could not be loaded.' });
      router.back();
    }
  }, [post, router]);

  const [title, setTitle] = useState(post?.title || "");
  const [description, setDescription] = useState(post?.description || "");
  const [isPublic, setIsPublic] = useState(post?.visibility === "public");
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutateAsync: updatePostDetails } = useMutation({
    mutationFn: updatePortfolioMutation,
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!post || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // Build full payload with all existing values + updated fields
      const payload: Record<string, any> = {
        title: title.trim(),
        description: description.trim(),
        mediaUrls: post.mediaUrls,
        tags: selectedTags,
        visibility: isPublic ? "public" : "private",
      };

      // Only include coverUrls when present in the original post
      if (post.coverUrls) {
        payload.coverUrls = post.coverUrls;
      }

      await updatePostDetails({ id: post._id, payload });
      await queryClient.invalidateQueries({ queryKey: ["my-portfolio"] });
      Toast.show({ type: 'success', text1: 'Post Updated', text2: 'Changes saved successfully.' });
      router.back();
    } catch (error: any) {
      const msg = error?.message || 'Something went wrong. Please try again.';
      setErrorMessage(msg);
      Toast.show({ type: 'error', text1: 'Update Failed', text2: msg });
      setIsSubmitting(false);
    }
  };

  const isFormValid = title.trim().length > 0;

  if (!post) return null;

  return (
    <SafeAreaView className="flex-1 bg-[#060D1A]" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between border-b border-white/10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2" disabled={isSubmitting}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text className="font-outfit-bold text-white text-lg">Edit Post</Text>
        <TouchableOpacity onPress={handleSave} disabled={!isFormValid || isSubmitting}>
          {isSubmitting ? (
            <Loader />
          ) : (
            <Text className={`font-outfit-bold text-lg ${isFormValid ? "text-[#0EA5E9]" : "text-white/30"}`}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        {/* Media Preview (Read-only) */}
        <View className="items-center mb-6">
          {post.mediaUrls?.mediaType === 'video' ? (
            <EditVideoPlayer uri={post.mediaUrls?.url || ""} />
          ) : (
            <Image
              source={{ uri: post.mediaUrls?.url || post.coverUrls?.url || "" }}
              style={{ width: "100%", aspectRatio: 1, borderRadius: 12 }}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Error Banner */}
        {errorMessage && (
          <View className="bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <Text className="font-outfit-medium text-red-400 text-sm">{errorMessage}</Text>
          </View>
        )}

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
          label="Description"
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
              className={`px-4 py-2 rounded-full border ${selectedTags.includes(tag)
                  ? "bg-secondary/20 border-secondary"
                  : "bg-white/5 border-white/10"
                }`}
            >
              <Text className={`font-outfit-medium text-sm ${selectedTags.includes(tag) ? "text-white" : "text-text-secondary"
                }`}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Visibility Toggle */}
        <View className="flex-row items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 mt-2 mb-10">
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
