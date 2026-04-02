import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Share, ScrollView, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Share2 } from 'lucide-react-native';
import Head from 'expo-router/head';
import { useVideoPlayer, VideoView } from 'expo-video';
import Toast from 'react-native-toast-message';

import { getPortfolioByIdQuery } from '@services/queries';
import { likePortfolioPostMutation, unlikePortfolioPostMutation } from '@services/mutations';
import type { PortfolioPost } from '@/types/portfolio';

// Local Video Player Mirroring the Modal Player
function PostVideoPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, player => {
    player.loop = true;
    player.play();
  });

  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const [showPlay, setShowPlay] = useState(false);

  const flashFeedback = (isPlaying: boolean) => {
    setShowPlay(!isPlaying);
    feedbackOpacity.setValue(0.7);
    Animated.timing(feedbackOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    const wasPlaying = player.playing;
    if (wasPlaying) player.pause();
    else player.play();
    flashFeedback(wasPlaying);
  };

  const seekForward = () => {
    player.currentTime += 5;
  };

  const seekBackward = () => {
    player.currentTime = Math.max(0, player.currentTime - 5);
  };

  return (
    <View className="w-full relative h-[400px] bg-[#0F172A] rounded-xl overflow-hidden">
      <VideoView 
        player={player} 
        style={{ flex: 1 }} 
        contentFit="contain"
        nativeControls={false}
      />
      <View style={{ ...StyleSheet.absoluteFillObject, flexDirection: "row" }} collapsable={false}>
        <TouchableOpacity activeOpacity={1} onPress={handlePress} onLongPress={seekBackward} delayLongPress={500} style={{ flex: 1 }} />
        <TouchableOpacity activeOpacity={1} onPress={handlePress} onLongPress={seekForward} delayLongPress={500} style={{ flex: 1 }} />
      </View>
      {/* Play/Pause visual feedback */}
      <Animated.View 
        pointerEvents="none" 
        style={[StyleSheet.absoluteFillObject, { alignItems: "center", justifyContent: "center", opacity: feedbackOpacity }]}
      >
        <View className="w-16 h-16 rounded-full bg-black/60 items-center justify-center">
          <Text className="text-white text-2xl font-outfit-bold">{showPlay ? "▶" : "❚❚"}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

export default function PortfolioDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch the specific portfolio item
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['portfolio', id],
    queryFn: () => getPortfolioByIdQuery(id!),
    enabled: !!id,
  });

  const { mutate: likePost } = useMutation({
    mutationFn: likePortfolioPostMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", id] });
      queryClient.invalidateQueries({ queryKey: ["my-portfolio"] });
    },
  });

  const { mutate: unlikePost } = useMutation({
    mutationFn: unlikePortfolioPostMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", id] });
      queryClient.invalidateQueries({ queryKey: ["my-portfolio"] });
    },
  });

  const [likeTimer, setLikeTimer] = useState<NodeJS.Timeout | null>(null);

  const handleToggleLike = () => {
    if (!post) return;
    const isLiking = !post.likedByMe;

    // Optimistic Update
    queryClient.setQueryData(["portfolio", id], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        likedByMe: isLiking,
        likeCount: Math.max(0, (oldData.likeCount || 0) + (isLiking ? 1 : -1))
      };
    });

    if (likeTimer) clearTimeout(likeTimer);

    const newTimer = setTimeout(() => {
      // Re-fetch current state to ensure valid DB transaction
      const currentCache: any = queryClient.getQueryData(["portfolio", id]);
      if (currentCache) {
        if (currentCache.likedByMe) {
          likePost({ portfolioId: post._id });
        } else {
          unlikePost({ portfolioId: post._id });
        }
      }
    }, 800);
    setLikeTimer(newTimer);
  };

  const handleShare = async () => {
    if (!post) return;
    try {
      await Share.share({
        message: `Check out my portfolio post: ${post.title}\n\nhttps://camroo-launchpad-881298ae.vercel.app/portfolio/${post._id}`,
      });
    } catch (error) {
      console.log("Error sharing", error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </SafeAreaView>
    );
  }

  if (isError || !post) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-4">
        <Text className="font-outfit-bold text-center text-lg text-slate-800">Post Not Found</Text>
        <Text className="font-outfit text-center text-slate-500 mt-2">This post may have been deleted or is private.</Text>
        <TouchableOpacity 
          className="mt-6 bg-slate-900 px-6 py-3 rounded-full"
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
        >
          <Text className="font-outfit-bold text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const imageUrl = post.mediaUrls?.url || post.coverUrls?.url || "";

  return (
    <>
      <Head>
        <title>{post.title || 'Camaroo Portfolio'}</title>
        <meta name="description" content={post.description || 'Check out this portfolio post on Camaroo'} />
        <meta property="og:title" content={post.title || 'Camaroo Portfolio'} />
        <meta property="og:description" content={post.description || 'Check out this portfolio post on Camaroo'} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title || 'Camaroo Portfolio'} />
        <meta name="twitter:description" content={post.description || 'Check out this portfolio post on Camaroo'} />
        <meta name="twitter:image" content={imageUrl} />
      </Head>

      <SafeAreaView className="flex-1 bg-[#F8FAFC]">
        {/* Basic Header */}
        <View className="px-4 py-3 border-b border-slate-100 bg-white flex-row items-center">
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')} className="p-2 -ml-2">
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text className="font-outfit-bold text-lg text-slate-900 ml-2">Post Details</Text>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          {/* Post Card */}
          <View className="w-full bg-white rounded-3xl py-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] pb-6">
            
            {/* User Info */}
            {post.userData && (
              <View className="flex-row items-center mb-4 px-4">
                <Image source={{ uri: post.userData.profilePicture || "https://github.com/shadcn.png" }} className="w-10 h-10 rounded-full bg-slate-100" />
                <View className="flex-1 mx-3">
                  <Text className="font-outfit-bold text-base text-slate-900">{post.userData.fullName || "User"}</Text>
                  <Text className="font-outfit text-xs text-slate-500 capitalize">{post.userData.role?.[0] || "Creative"}</Text>
                </View>
              </View>
            )}

            {/* Title & Description */}
            <View className="mb-4 px-4">
              <Text className="font-outfit-bold text-base text-slate-900 leading-tight">
                {post.title || "Untitled Post"}
              </Text>
              {post.description ? (
                <Text className="font-outfit text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {post.description}
                </Text>
              ) : null}
            </View>

            {/* Full edge-to-edge Image/Video */}
            <View className="w-full bg-slate-900 items-center justify-center">
              {post.mediaUrls?.mediaType === "video" ? (
                <PostVideoPlayer uri={post.mediaUrls?.url || ""} />
              ) : (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: "100%", aspectRatio: 1 }}
                  resizeMode="cover"
                />
              )}
            </View>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <View className="flex-row flex-wrap items-center gap-1.5 mt-4 px-4">
                {post.tags.map((tag: string) => (
                  <View key={tag} className="bg-slate-100 rounded-full px-3 py-1.5">
                    <Text className="font-outfit-medium text-[12px] text-slate-600">{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Engagements */}
            <View className="flex-row items-center mt-5 px-4">
              <View className="flex-row items-center bg-slate-100 rounded-full px-2 py-1.5">
                <TouchableOpacity onPress={handleToggleLike} className="flex-row items-center gap-1.5 px-3">
                  <Heart size={20} color={post.likedByMe ? "#EF4444" : "#64748B"} fill={post.likedByMe ? "#EF4444" : "transparent"} />
                  <Text className={`font-outfit-medium text-sm ${post.likedByMe ? "text-red-500" : "text-slate-500"}`}>
                    {post.likeCount || 0}
                  </Text>
                </TouchableOpacity>

                <View className="w-[1px] h-4 bg-slate-300 mx-1" />

                <TouchableOpacity onPress={handleShare} className="flex-row items-center px-3">
                  <Share2 size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
