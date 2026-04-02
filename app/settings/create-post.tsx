import React, { useState } from "react";
import { View, Text, Switch, TouchableOpacity, Image, Dimensions, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from "expo-video";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ImagePlus } from "lucide-react-native";
import { Input } from "@components/Input";
import { usePortfolioUpload } from "@hooks/usePortfolioUpload";
import { Loader } from "@components/ui/Loader";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from 'react-native-toast-message';

const AVAILABLE_TAGS = ["Wedding", "Portrait", "Fashion", "Commercial", "Event", "Product", "Nature"];

function PostVideoPlayer({ uri }: { uri: string }) {
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

export default function CreatePostScreen() {
  const router = useRouter();
  const { mediaUri, mediaType } = useLocalSearchParams<{ mediaUri: string; mediaType: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [coverMimeType, setCoverMimeType] = useState<string | null>(null);

  const { startUpload } = usePortfolioUpload();

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCoverUri(result.assets[0].uri);
      setCoverMimeType(result.assets[0].mimeType || 'image/jpeg');
    }
  };

  const handlePost = async () => {
    if (!mediaUri || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

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
        coverUri: coverUri || undefined,
        coverMimeType: coverMimeType || undefined,
      });

      Toast.show({ type: 'success', text1: 'Upload started', text2: 'Your post is uploading in the background.' });
      router.back();
    } catch (error: any) {
      const msg = error?.message || 'Something went wrong. Please try again.';
      setErrorMessage(msg);
      Toast.show({ type: 'error', text1: 'Upload Failed', text2: msg });
      setIsSubmitting(false);
    }
  };

  const isVideo = mediaType === 'video';
  const isFormValid = title.trim().length > 0 &&
    (!isVideo || (description.trim().length > 0 && coverUri !== null));

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

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 60}
        showsVerticalScrollIndicator={false}
      >
        {/* Media Preview */}
        <View className="items-center mb-6">
          {mediaUri ? (
            mediaType === 'video' ? (
              <View className="w-full">
                <PostVideoPlayer uri={mediaUri} />
                <TouchableOpacity
                  onPress={pickCoverImage}
                  disabled={isSubmitting}
                  className="mt-4 flex-row items-center p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  {coverUri ? (
                    <Image source={{ uri: coverUri }} className="w-16 h-16 rounded-lg mr-4" resizeMode="cover" />
                  ) : (
                    <View className="w-16 h-16 rounded-lg bg-black/30 items-center justify-center mr-4 border border-[#0EA5E9]/30">
                      <ImagePlus size={20} color="#0EA5E9" />
                    </View>
                  )}
                  <View className="flex-1 justify-center">
                    <Text className={`font-outfit-medium ${coverUri ? "text-white" : "text-[#0EA5E9]"}`}>
                      {coverUri ? "Change Cover Image" : "Pick Cover Image (Required)"}
                    </Text>
                    {coverUri && <Text className="font-outfit text-xs text-white/50 mt-1">Tap to re-select</Text>}
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <Image
                source={{ uri: mediaUri }}
                style={{ width: "100%", aspectRatio: 1, borderRadius: 12 }}
                resizeMode="cover"
              />
            )
          ) : (
            <View className="w-full h-64 rounded-xl bg-white/5 items-center justify-center">
              <Text className="text-white/50 font-outfit">No Media</Text>
            </View>
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
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
