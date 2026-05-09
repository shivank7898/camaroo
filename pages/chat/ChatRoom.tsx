import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, FlatList, Keyboard, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import TopGradientFade from "@/components/ui/TopGradientFade";
import DefaultProfilePicture from "@/components/ui/DefaultProfilePicture";

import { useChatRoom } from "@/hooks/useChatRoom";
import { useAuthStore } from "@store/authStore";
import { CustomMessageBubble } from "@/components/chat/CustomMessageBubble";
import { CustomChatInput } from "@/components/chat/CustomChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import type { ChatMessage } from "@/types/chat";

export default function ChatRoom() {
  const { id, name, avatar } = useLocalSearchParams<{ id: string; name?: string; avatar?: string }>();
  const insets = useSafeAreaInsets();
  
  const user = useAuthStore((state) => state.user) as any;
  const currentUserId = user?._id || user?.id || "unknown";

  const {
    messages,
    isLoading,
    isPaginating,
    isTyping,
    sendMessage,
    sendMediaMessage,
    loadOlderMessages,
    startTyping,
    stopTyping,
  } = useChatRoom(id);

  const [isUploadingAttachment, setIsUploadingAttachment] = React.useState(false);
  const [androidKbHeight, setAndroidKbHeight] = React.useState(0);
  React.useEffect(() => {
    if (Platform.OS !== "android") return;
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setAndroidKbHeight(e.endCoordinates.height + 8);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setAndroidKbHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = async (text: string, attachment?: {uri: string, mimeType: string, fileName: string}) => {
    if (attachment) {
      setIsUploadingAttachment(true);
      await sendMediaMessage(attachment.uri, attachment.mimeType, attachment.fileName, "image", text);
      setIsUploadingAttachment(false);
    } else {
      sendMessage(text);
    }
  };

  const handleTyping = (text: string) => {
    if (text.trim().length > 0) {
      startTyping();
    } else {
      stopTyping(true);
    }
  };

  const formatDividerDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    
    const timeDiff = today.getTime() - date.getTime();
    if (timeDiff > 0 && timeDiff < 7 * 24 * 60 * 60 * 1000) {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return days[date.getDay()];
    }
    
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  };

  const renderItem = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isOwn = item.senderId === currentUserId;
    
    let showDateDivider = false;
    const itemDate = new Date(item.createdAt || Date.now());
    
    if (index === messages.length - 1) {
      showDateDivider = !isPaginating; 
    } else {
      const nextMsg = messages[index + 1];
      const nextDate = new Date(nextMsg.createdAt || Date.now());
      if (itemDate.toDateString() !== nextDate.toDateString()) {
        showDateDivider = true;
      }
    }

    return (
      <View>
        {/* Because FlatList is inverted, this divider renders ABOVE the chunk of messages visually */}
        {showDateDivider && (
          <View className="flex-row justify-center py-5">
            <View className="bg-slate-100/60 shadow-sm px-4 py-1.5 rounded-full border border-slate-200">
               <Text className="font-outfit-medium text-xs text-slate-500 tracking-wide capitalize">
                 {formatDividerDate(itemDate)}
               </Text>
            </View>
          </View>
        )}
        <CustomMessageBubble message={item} isOwn={isOwn} />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      {/* Header */}
      <View className="flex-row items-center px-2 py-3 border-b border-slate-100 bg-white/90 z-20">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 mr-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        
        {/* Simple Avatar Placeholder */}
        {avatar ? (
          <Image source={{ uri: avatar }} className="w-10 h-10 rounded-full bg-slate-100 mr-3 border border-slate-200" />
        ) : (
          <View className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden items-center justify-center mr-3 border border-slate-200">
            <DefaultProfilePicture />
          </View>
        )}

        <View className="flex-1">
          <Text className="font-outfit-bold text-[17px] text-slate-900 tracking-tight" numberOfLines={1}>
            {name || "Chat"}
          </Text>
          {isTyping && (
            <Text className="font-outfit-medium text-xs text-sky-500">typing...</Text>
          )}
        </View>
      </View>

      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={8}>
          <View className="flex-1 bg-white/20">
            <TopGradientFade height={450} />
            {isLoading && messages.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0ea5e9" />
              </View>
            ) : (
              <FlatList
                inverted
                data={messages}
                keyExtractor={(item: any) => item._id || item.clientMessageId || Math.random().toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 16 }}
                onEndReached={loadOlderMessages}
                onEndReachedThreshold={0.5} 
                ListHeaderComponent={() => (
                  <View className="justify-end items-start w-full">
                    {isTyping && <TypingIndicator />}
                  </View>
                )}
                ListFooterComponent={() => isPaginating ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator size="small" color="#cbd5e1" />
                  </View>
                ) : null}
              />
            )}
          </View>
          <CustomChatInput onSend={handleSend} onTyping={handleTyping} isUploading={isUploadingAttachment} />
        </KeyboardAvoidingView>
      ) : (
        <View style={{ flex: 1, paddingBottom: androidKbHeight }}>
          <View className="flex-1 bg-white/20">
            <TopGradientFade height={450} />
            {isLoading && messages.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0ea5e9" />
              </View>
            ) : (
              <FlatList
                inverted
                data={messages}
                keyExtractor={(item: any) => item._id || item.clientMessageId || Math.random().toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 16 }}
                onEndReached={loadOlderMessages}
                onEndReachedThreshold={0.5} 
                ListHeaderComponent={() => (
                  <View className="justify-end items-start w-full">
                    {isTyping && <TypingIndicator />}
                  </View>
                )}
                ListFooterComponent={() => isPaginating ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator size="small" color="#cbd5e1" />
                  </View>
                ) : null}
              />
            )}
          </View>
          <CustomChatInput onSend={handleSend} onTyping={handleTyping} isUploading={isUploadingAttachment} />
        </View>
      )}
    </SafeAreaView>
  );
}
