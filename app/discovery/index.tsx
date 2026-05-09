import React, { useState, useEffect, useMemo } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Search } from "lucide-react-native";
import TopGradientFade from "@/components/ui/TopGradientFade";
import Input from "@/components/Input";
import DefaultProfilePicture from "@/components/ui/DefaultProfilePicture";
import { useQuery } from "@tanstack/react-query";
import { searchUsersQuery } from "@/services/queries";
import { useAuthStore } from "@/store/authStore";

export default function DiscoveryListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user) as any;

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: searchResponse, isLoading } = useQuery({
    queryKey: ["discoveryListUsers", debouncedQuery],
    queryFn: () => searchUsersQuery(debouncedQuery),
  });

  const searchedUsers = useMemo(() => {
    let arr = searchResponse?.data?.data || searchResponse?.data || searchResponse || [];
    if (!Array.isArray(arr)) arr = [];
    const currentUserId = user?._id || user?.id;
    return arr.filter((u: any) => u._id !== currentUserId && u.id !== currentUserId);
  }, [searchResponse, user]);

  return (
    <View className="flex-1 bg-white">
      <TopGradientFade />
      <SafeAreaView className="flex-1 relative" edges={["top"]}>
        {/* Header */}
        <View className="px-5 py-4 flex-row justify-between items-center z-20 border-b border-black/5 mb-2">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 items-center justify-center mr-2 -ml-3">
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-2xl font-outfit-bold text-black tracking-tight">Discover</Text>
          </View>
        </View>

        <View className="px-5 mb-2 z-20">
          <Input 
            variant="light"
            placeholder="Search users using name, city, state, roles"
            startIcon={<Search size={20} color="#64748b" />}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* List */}
        <FlatList
          data={searchedUsers}
          keyExtractor={(item: any) => item._id || item.id}
          contentContainerStyle={{ paddingBottom: (insets.bottom || 0) + 120, paddingTop: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.7}
              className="flex-row items-center px-5 py-4 bg-white border-b border-slate-50"
              onPress={() => router.push(`/user/${item._id || item.id}`)}
            >
              {item.profile_picture || item.profilePicture ? (
                <Image source={{ uri: item.profile_picture || item.profilePicture }} className="w-14 h-14 rounded-full bg-slate-100 border border-black/5" />
              ) : (
                <View className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 border border-black/5">
                  <DefaultProfilePicture />
                </View>
              )}
              <View className="flex-1 ml-4 justify-center">
                <Text className="font-outfit-bold text-base text-slate-900">{item.full_name || item.fullName || "User"}</Text>
                {item.category && item.category !== "single" && (
                  <Text className="font-outfit-medium text-xs text-sky-600 uppercase tracking-widest mt-0.5">{item.category}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            isLoading ? (
               <View className="flex-1 items-center justify-center pt-20">
                 <ActivityIndicator size="large" color="#0ea5e9" />
               </View>
            ) : (
              <View className="flex-1 items-center justify-center pt-20">
                <Text className="font-outfit-medium text-slate-500">No users found.</Text>
              </View>
            )
          }
        />
      </SafeAreaView>
    </View>
  );
}
