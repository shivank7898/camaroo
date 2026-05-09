import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Clock } from "lucide-react-native";
import type { Conversation } from "@/types/chat";
import { useAuthStore } from "@store/authStore";
import DefaultProfilePicture from "@/components/ui/DefaultProfilePicture";

interface ConversationRowProps {
  conversation: Conversation;
  onPress: (id: string, participantName: string, avatarUrl: string) => void;
}

export const ConversationRow = ({ conversation, onPress }: ConversationRowProps) => {
  const currentUserId = useAuthStore((state) => state.user?.id || (state.user as any)?._id);
  
  // Find the other participant
  const participant = conversation.participants?.find((p) => p._id !== currentUserId) || conversation.participants?.[0];
  
  if (!participant) return null;

  const { fullName, profilePicture } = participant;
  
  // Format time (e.g. "10:30 AM" or "Apr 3")
  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const lastMessageText = conversation.lastMessage?.content || "Tap to chat";
  const isUnread = conversation.unreadCount > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(conversation._id, fullName, profilePicture || "")}
      className="flex-row items-center px-5 py-4 bg-white border-b border-slate-50"
    >
      <View className="relative">
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} className="w-14 h-14 rounded-full bg-slate-100" />
        ) : (
          <View className="w-14 h-14 rounded-full overflow-hidden bg-slate-100">
            <DefaultProfilePicture />
          </View>
        )}
      </View>

      <View className="flex-1 ml-4 justify-center">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="font-outfit-bold text-base text-slate-900" numberOfLines={1}>
            {fullName || "Unknown"}
          </Text>
          <Text className={`font-outfit-medium text-xs ${isUnread ? "text-sky-500" : "text-slate-400"}`}>
            {formatTime(conversation.updatedAt)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text
            className={`font-outfit text-sm flex-1 mr-4 ${isUnread ? "font-outfit-bold text-slate-800" : "font-outfit text-slate-500"}`}
            numberOfLines={1}
          >
            {lastMessageText}
          </Text>
          
          {isUnread && (
            <View className="bg-sky-500 min-w-[20px] h-5 rounded-full items-center justify-center px-1.5">
              <Text className="font-outfit-bold text-[10px] text-white">
                {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
