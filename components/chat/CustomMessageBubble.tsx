import React, { useState } from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Check, CheckCheck } from "lucide-react-native";
import type { ChatMessage } from "@/types/chat";

interface CustomMessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export function CustomMessageBubble({ message, isOwn }: CustomMessageBubbleProps) {
  // Format MM:HH AM/PM
  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  const [imageRatio, setImageRatio] = useState<number>(1);
  React.useEffect(() => {
    let isMounted = true;
    if (message.messageType === "image" && message.meta?.mediaUrl) {
      Image.getSize(message.meta.mediaUrl, (w, h) => {
        if (isMounted && w && h) setImageRatio(w / h);
      }, () => {});
    }
    return () => { isMounted = false; };
  }, [message.messageType, message.meta?.mediaUrl]);

  const renderContent = (isOwnSide: boolean) => {
    if (message.messageType === "image" && message.meta?.mediaUrl) {
      const isSending = message.status === "sending";
      const hasText = message.content && message.content.trim().length > 0;
      
      const imageNode = (
        <View className="relative rounded-[16px] overflow-hidden bg-slate-200" style={{ width: 220, aspectRatio: imageRatio }}>
          <Image 
            source={{ uri: message.meta.mediaUrl }} 
            className="w-full h-full" 
            resizeMode="cover" 
            style={{ opacity: isSending ? 0.6 : 1 }}
          />
          {isSending && (
            <View className="absolute inset-0 items-center justify-center bg-black/10">
              <ActivityIndicator color="#FFFFFF" size="small" />
            </View>
          )}
        </View>
      );

      if (!hasText) return imageNode;

      // Combined Layout
      if (isOwnSide) {
        return (
          <LinearGradient
            colors={["#6A11CB", "#2575FC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 4,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 4,
            }}
          >
            {imageNode}
            <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text className="font-outfit text-white text-[15px] leading-6">
                {message.content}
              </Text>
            </View>
          </LinearGradient>
        );
      } else {
        return (
          <View 
            className="bg-slate-100"
            style={{
              padding: 4,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 20,
            }}
          >
            {imageNode}
            <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text className="font-outfit text-slate-800 text-[15px] leading-6">
                {message.content}
              </Text>
            </View>
          </View>
        );
      }
    }
    
    if (isOwnSide) {
      return (
        <LinearGradient
          colors={["#6A11CB", "#2575FC"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 4,
          }}
        >
          <Text className="font-outfit text-white text-[15px] leading-6">
            {message.content}
          </Text>
        </LinearGradient>
      );
    } else {
      return (
        <View 
          className="bg-slate-100"
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 20,
          }}
        >
          <Text className="font-outfit text-slate-800 text-[15px] leading-6">
            {message.content}
          </Text>
        </View>
      );
    }
  };

  if (isOwn) {
    return (
      <View className="flex-row justify-end mb-4 px-4 w-full">
        <View className="max-w-[75%] items-end">
          {renderContent(true)}
          
          <View className="flex-row items-center mt-1 mr-1">
            <Text className="font-outfit text-[11px] text-slate-400 mr-1.5">{time}</Text>
            {message.status === "sending" && <Text className="font-outfit text-[10px] text-sky-400">Sending...</Text>}
            {message.status === "sent" && <Check size={12} color="#94a3b8" />}
            {message.status === "delivered" && <CheckCheck size={14} color="#94a3b8" />}
            {message.status === "seen" && <CheckCheck size={14} color="#0ea5e9" />}
            {message.status === "failed" && <Text className="font-outfit text-[10px] text-red-500">Failed</Text>}
          </View>
        </View>
      </View>
    );
  }

  // Received Bubble
  return (
    <View className="flex-row justify-start mb-4 px-4 w-full">
      <View className="max-w-[75%] items-start">
        {renderContent(false)}
        <Text className="font-outfit text-[11px] text-slate-400 mt-1 ml-1">{time}</Text>
      </View>
    </View>
  );
}
