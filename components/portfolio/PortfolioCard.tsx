import React, { memo, useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, Image, Share, Alert, Dimensions, AppState, type AppStateStatus } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@store/authStore";
import { Heart, Share2, MoreHorizontal, Volume2, VolumeX } from "lucide-react-native";
import { likePortfolioPostMutation, unlikePortfolioPostMutation } from "@/services/mutations";
import type { PortfolioPost } from "@/types/portfolio";
import { useVideoPlayer, VideoView } from "expo-video";
import { ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PortfolioCardProps {
  post: PortfolioPost;
  queryKeyToInvalidate?: string[];
  /** Whether this card is the single active (most-visible) card */
  isActive?: boolean;
  /** The post ID that currently has audio unmuted (global) */
  activeAudioId?: string | null;
  /** Callback to claim audio for this post (auto-mutes others) */
  onUnmute?: (id: string | null) => void;
}

// ─── FeedVideoPlayer ─────────────────────────────────────────────────────────
interface FeedVideoPlayerProps {
  uri: string;
  postId: string;
  isActive: boolean;
  isAudioActive: boolean;
  onToggleMute: () => void;
}

function FeedVideoPlayer({ uri, postId, isActive, isAudioActive, onToggleMute }: FeedVideoPlayerProps) {
  const [hasPlayed, setHasPlayed] = useState(false);
  const [hasError, setHasError] = useState(false);
  const appState = useRef(AppState.currentState);

  // Create player — starts muted, looping
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
  });

  // ── Reset state on cell reuse (URI change) ──
  useEffect(() => {
    setHasPlayed(false);
    setHasError(false);
  }, [uri]);

  // ── Play/Pause driven by isActive ──
  useEffect(() => {
    try {
      if (isActive) {
        player.play();
      } else {
        player.pause();
      }
    } catch (e) {
      console.log("Player play/pause error:", e);
      setHasError(true);
    }
  }, [isActive, player]);

  // ── Mute/Unmute driven by global audio state ──
  useEffect(() => {
    try {
      player.muted = !isAudioActive;
    } catch (e) {
      // Player may not be ready yet
    }
  }, [isAudioActive, player]);

  // ── Detect buffered / playing state ──
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        if (player.playing || player.currentTime > 0) {
          setHasPlayed(true);
          clearInterval(interval);
        }
      } catch (e) {
        clearInterval(interval);
        setHasError(true);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [player]);

  // ── AppState: pause on background ──
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState !== "active" && isActive) {
        try { player.pause(); } catch (_) {}
      } else if (nextState === "active" && isActive) {
        try { player.play(); } catch (_) {}
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [isActive, player]);

  // ── Tab/screen focus: pause when navigating away ──
  useFocusEffect(
    useCallback(() => {
      return () => {
        try { player.pause(); } catch (_) {}
      };
    }, [player])
  );

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch (_) {}
    };
  }, [player]);

  // ── Error fallback ──
  if (hasError) {
    return (
      <View style={{ width: "100%", height: "100%", backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#94A3B8", fontFamily: "Outfit-Medium", fontSize: 13 }}>Video unavailable</Text>
      </View>
    );
  }

  return (
    <View style={{ width: "100%", height: "100%", backgroundColor: "#1e293b" }}>
      <VideoView
        style={{ width: "100%", height: "100%", position: "absolute" }}
        player={player}
        contentFit="contain"
        nativeControls={false}
      />

      {/* Skeleton loader */}
      {!hasPlayed && (
        <View
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#E2E8F0", justifyContent: "center", alignItems: "center", zIndex: 10 }}
        >
          <ActivityIndicator size="large" color="#94A3B8" />
        </View>
      )}

      {/* Mute/Unmute button — bottom right */}
      {hasPlayed && (
        <TouchableOpacity
          onPress={onToggleMute}
          activeOpacity={0.8}
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 20,
          }}
        >
          {isAudioActive ? (
            <Volume2 size={18} color="#FFFFFF" />
          ) : (
            <VolumeX size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── PortfolioCard ────────────────────────────────────────────────────────────

const PortfolioCardComponent = ({
  post,
  queryKeyToInvalidate = ["global-portfolio-feed"],
  isActive = false,
  activeAudioId = null,
  onUnmute,
}: PortfolioCardProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currentUserId = (user as any)?._id || (user as any)?.id;

  const isVideo = post.mediaUrls?.mediaType === "video";
  const isAudioActive = activeAudioId === post._id;

  const mediaSrc = post.mediaUrls?.url || post.coverUrls?.url || "";

  const handleToggleMute = () => {
    if (onUnmute) {
      // If already unmuted, mute it. Otherwise claim audio.
      onUnmute(isAudioActive ? null : post._id);
    }
  };

  const handleToggleLike = async () => {
    try {
      const isLiking = !post.likedByMe;
      queryClient.setQueryData(queryKeyToInvalidate, (oldData: any) => {
        if (!oldData || !oldData.data) return oldData;
        const newData = oldData.data.map((p: any) =>
          p._id === post._id
            ? { ...p, likedByMe: isLiking, likeCount: Math.max(0, (p.likeCount || 0) + (isLiking ? 1 : -1)) }
            : p
        );
        return { ...oldData, data: newData };
      });

      if (isLiking) {
        await likePortfolioPostMutation({ portfolioId: post._id });
      } else {
        await unlikePortfolioPostMutation({ portfolioId: post._id });
      }
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
    } catch (e) {
      console.log(e);
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this portfolio post: ${post.title || "Untitled"}\n\nhttps://camroo-launchpad-881298ae.vercel.app/portfolio/${post._id}`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleUserNavigate = (e: any) => {
    e.stopPropagation();
    const creatorId = post.userData?._id;
    if (creatorId && creatorId !== currentUserId) {
      router.push({ pathname: "/user/[id]" as any, params: { id: creatorId } });
    }
  };

  const creatorName = post.userData?.fullName || "User";
  const creatorPfp =
    post.userData?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=0D8ABC&color=fff&size=128`;

  return (
    <View className="bg-white pb-4 mb-4 border-b border-slate-100">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity activeOpacity={0.8} onPress={handleUserNavigate} className="flex-row items-center flex-1">
          <Image source={{ uri: creatorPfp }} className="w-9 h-9 rounded-full bg-slate-200" />
          <View className="ml-3">
            <Text className="font-outfit-bold text-sm text-slate-900">{creatorName}</Text>
            {(post.userData as any)?.city && (
              <Text className="font-outfit text-xs text-slate-500">{(post.userData as any).city}</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Media */}
      <View 
        className="w-full bg-slate-900" 
        style={{ width: SCREEN_WIDTH, height: Math.min(SCREEN_WIDTH * 1.2, 500) }}
      >
        {mediaSrc ? (
          isVideo ? (
            isActive ? (
              // Only mount the native video player for the ACTIVE card (prevents OOM)
              <FeedVideoPlayer
                uri={mediaSrc}
                postId={post._id}
                isActive={isActive}
                isAudioActive={isAudioActive}
                onToggleMute={handleToggleMute}
              />
            ) : (
              // Inactive video cards: show cover image + play icon (zero native memory)
              <View style={{ width: "100%", height: "100%" }}>
                <Image
                  source={{ uri: post.coverUrls?.url || mediaSrc }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="contain"
                />
                <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: "#FFF", fontSize: 20 }}>▶</Text>
                  </View>
                </View>
              </View>
            )
          ) : (
            <Image source={{ uri: mediaSrc }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
          )
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="font-outfit text-slate-400">Media Unavailable</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View className="flex-row items-center justify-between px-4 py-3 mt-1">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={handleToggleLike} className="flex-row items-center gap-2">
            <Heart
              size={24}
              color={post.likedByMe ? "#EF4444" : "#1E293B"}
              fill={post.likedByMe ? "#EF4444" : "transparent"}
            />
            <Text className={`font-outfit-medium text-sm ${post.likedByMe ? "text-red-500" : "text-slate-700"}`}>
              {post.likeCount || 0}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleShare} className="p-1">
          <Share2 size={22} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <View className="px-4">
        {post.title ? (
          <Text className="font-outfit-medium text-sm text-slate-900 mb-1">{post.title}</Text>
        ) : null}
        {post.description ? (
          <Text className="font-outfit text-sm text-slate-600 leading-tight">
            <Text className="font-outfit-bold text-slate-800">{creatorName} </Text>
            {post.description}
          </Text>
        ) : null}
        {post.tags && post.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mt-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Text key={tag} className="font-outfit text-xs text-sky-600">
                #{tag}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export const PortfolioCard = memo(PortfolioCardComponent);
