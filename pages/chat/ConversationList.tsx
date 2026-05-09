import React, { useEffect, useState, useMemo } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import TopGradientFade from "@components/ui/TopGradientFade";
import { ConversationRow } from "@components/chat/ConversationRow";
import { useConversations } from "@/hooks/useConversations";
import { useAuthStore } from "@store/authStore";
import Input from "@components/Input";
import { Search, MessageCircle } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { searchUsersQuery } from "@/services/queries";
import { createConversationMutation } from "@/services/mutations";
import DefaultProfilePicture from "@/components/ui/DefaultProfilePicture";

export default function ConversationList() {
  const { conversations, isLoading, isFetching, refresh } = useConversations();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user) as any;
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // More robust debounce (1000ms) to ensure smooth typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: searchResponse, isLoading: isSearchLoading } = useQuery({
    queryKey: ["searchUsers", debouncedQuery],
    queryFn: () => searchUsersQuery(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  });

  // Clear search results whenever leaving the screen
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setSearchQuery("");
        setDebouncedQuery("");
      };
    }, [])
  );

  const searchedUsers = useMemo(() => {
    // API returns { isSuccess: true, data: { data: [...] } }
    let arr = searchResponse?.data?.data || searchResponse?.data || searchResponse || [];
    if (!Array.isArray(arr)) arr = [];
    
    // Filter out the currently logged-in user
    const currentUserId = user?._id || user?.id;
    return arr.filter((u: any) => u._id !== currentUserId && u.id !== currentUserId);
  }, [searchResponse, user]);

  const handlePressConversation = (id: string, participantName: string, avatarUrl?: string) => {
    router.push({
      pathname: "/chat/[id]",
      params: { id, name: participantName, avatar: avatarUrl || "" },
    });
  };

  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const handlePressUser = async (userId: string, fullName: string, avatarUrl: string) => {
    // If we have an existing conversation with this user, route to that room.
    const existingConv = conversations.find(c => 
      c.participants?.some(p => p._id === userId || (p as any).id === userId) && c.participants?.length === 2
    );
    if (existingConv) {
      handlePressConversation(existingConv._id, fullName, avatarUrl);
    } else {
      try {
        setIsCreatingRoom(true);
        // Create new chat room using the REST API
        const res = await createConversationMutation(userId);
        const newConvId = res?.data?._id || res?._id || res?.conversation?._id || userId;
        
        router.push({
          pathname: "/chat/[id]",
          params: { id: newConvId, name: fullName, avatar: avatarUrl || "" },
        });
      } catch (err: any) {
        if (err?.message?.includes("not found") || err?.message?.includes("conversation not found")) {
          console.log("[useChatRoom] This is a new conversation that has no history yet.");
        } else {
          console.error("[useChatRoom] Failed to create conversation:", err);
        }
      } finally {
        setIsCreatingRoom(false);
      }
    }
  };

  if (!token) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="font-outfit-medium text-slate-500">Sign in to view messages.</Text>
      </SafeAreaView>
    );
  }

  const isSearching = debouncedQuery.trim().length > 0;

  return (
    <View className="flex-1 bg-white">
      <TopGradientFade />

      {/* Header and Floating Search Bar */}
      <View className="px-5 z-20 absolute top-0 left-0 right-0" style={{ paddingTop: (insets.top || 0) + 16 }}>
        <View className="flex-row items-center gap-3 mb-4">
          <Text className="text-3xl font-outfit-bold text-black tracking-tight">Messages</Text>
        </View>
        <Input 
          variant="light"
          placeholder="Search users..."
          startIcon={<Search size={20} color="#64748b" />}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isSearching ? (
        <FlatList
          data={searchedUsers}
          keyExtractor={(item: any) => item._id || item.id}
          contentContainerStyle={{ paddingTop: (insets.top || 0) + 140, paddingBottom: 130 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              className="flex-row items-center px-5 py-4 bg-white border-b border-slate-50"
              onPress={() => handlePressUser(item._id || item.id, item.full_name || item.fullName, item.profile_picture || item.profilePicture || "")}
            >
              {item.profile_picture || item.profilePicture ? (
                <Image source={{ uri: item.profile_picture || item.profilePicture }} className="w-12 h-12 rounded-full bg-slate-100" />
              ) : (
                <View className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                  <DefaultProfilePicture />
                </View>
              )}
              <View className="flex-1 ml-4 justify-center">
                <Text className="font-outfit-bold text-base text-slate-900">{item.full_name || item.fullName || "Unknown"}</Text>
                {item.category && item.category !== "single" && (
                  <Text className="font-outfit-medium text-xs text-slate-500">{item.category}</Text>
                )}
              </View>
              <MessageCircle size={24} color="#0ea5e9" opacity={0.6} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            isSearchLoading ? (
               <View className="flex-1 pt-4 px-5">
                 {[1,2,3].map((i) => (
                   <View key={i} className="flex-row items-center py-4 border-b border-slate-50">
                     <View className="w-12 h-12 rounded-full bg-slate-100" />
                     <View className="flex-1 ml-4 justify-center">
                       <View className="h-4 bg-slate-100 rounded w-32" />
                     </View>
                   </View>
                 ))}
               </View>
            ) : (
              <View className="flex-1 items-center justify-center pt-20">
                <Text className="font-outfit-medium text-slate-500">No users found</Text>
              </View>
            )
          }
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
             <ConversationRow
               conversation={item}
               onPress={handlePressConversation}
             />
          )}
          contentContainerStyle={{ paddingTop: (insets.top || 0) + 140, paddingBottom: 130 }}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refresh} colors={["#0ea5e9"]} tintColor="#0ea5e9" />
          }
          ListEmptyComponent={
            isLoading ? (
              <View className="flex-1 pt-4 px-5">
                {[1,2,3,4].map((i) => (
                  <View key={i} className="flex-row items-center py-4 border-b border-slate-50">
                    <View className="w-14 h-14 rounded-full bg-slate-100" />
                    <View className="flex-1 ml-4 justify-center space-y-2">
                      <View className="h-4 bg-slate-100 rounded w-24 mb-2" />
                      <View className="h-3 bg-slate-100 rounded min-w-[200px]" />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="flex-1 items-center justify-center pt-20 px-8">
                <Text className="font-outfit-medium text-lg text-slate-700 text-center mb-2">No messages yet</Text>
                <Text className="font-outfit-regular text-sm text-slate-500 text-center">
                  Start a conversation by searching someone or visiting their profile.
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}
