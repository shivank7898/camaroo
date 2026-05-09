import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Image, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, MapPin, Calendar, Video } from "lucide-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useOpportunityDetail } from "@/hooks/useOpportunityDetail";
import { useUserStore } from "@/store/userStore";
import { useGlobalStore } from "@/store/globalStore";
import { ApplicationCard } from "@/components/opportunity/ApplicationCard";
import { applyToOpportunityMutation, reviewApplicationMutation, cancelOpportunityMutation } from "@/services/mutations";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useVideoPlayer, VideoView } from "expo-video";

const ImagePreview = ({ url }: {url: string}) => {
  const [loading, setLoading] = useState(true);
  return (
    <View className="w-full h-[80%] items-center justify-center">
      {loading && <ActivityIndicator color="#FFF" size="large" className="absolute z-10" />}
      <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} resizeMode="contain" onLoad={() => setLoading(false)} />
    </View>
  );
};

const InlineVideoPlayer = ({ url }: {url: string}) => {
  const player = useVideoPlayer(url, player => { player.loop = true; player.play(); });
  return (
    <View className="w-full h-[80%] items-center justify-center bg-black">
      {!player.playing && <ActivityIndicator color="#FFF" size="large" className="absolute z-10" />}
      <VideoView style={{ width: '100%', height: '100%' }} player={player} allowsFullscreen allowsPictureInPicture />
    </View>
  );
};

export default function OpportunityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userData } = useUserStore();
  const currentUserId = userData?.user?._id;

  const { opportunity, applications, isLoading, isError, refetchAll } = useOpportunityDetail(id);

  // Application state
  const [isApplying, setIsApplying] = useState(false);
  const [apiError, setApiError] = useState("");
  const { showToast } = useGlobalStore();

  const applySchema = z.object({
    message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  });

  const { control, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(applySchema),
    defaultValues: { message: "" },
    mode: "onChange"
  });
  const [selectedPreview, setSelectedPreview] = useState<{url: string, mediaType: string} | null>(null);

  const applyMutation = useMutation({
    mutationFn: applyToOpportunityMutation,
    onSuccess: () => {
      showToast("Application sent successfully!", "success");
      setApiError("");
      refetchAll();
      router.back();
    },
    onError: (e: any) => {
      setApiError("Failed to apply: " + e.message);
    },
    onSettled: () => setIsApplying(false),
  });

  const reviewMutation = useMutation({
    mutationFn: reviewApplicationMutation,
    onSuccess: () => {
      showToast("Application updated successfully!", "success");
      setApiError("");
      refetchAll();
    },
    onError: (e: any) => {
      setApiError("Failed to update application: " + e.message);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelOpportunityMutation,
    onSuccess: () => {
      showToast("Opportunity cancelled.", "info");
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["myOpportunities"] });
      queryClient.invalidateQueries({ queryKey: ["opportunity", id] });
      router.back();
    },
    onError: (e: any) => {
      setApiError("Failed to cancel opportunity: " + e.message);
    },
  });

  if (isLoading || !opportunity) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  const creator = opportunity.userData || opportunity.userId || (typeof opportunity.createdBy === 'object' ? opportunity.createdBy : null);
  const isOwner = currentUserId === creator?._id;
  const isClosed = opportunity.status !== "open";
  
  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const isExpired = new Date(opportunity.endDate) < new Date(todayStr);

  const hasApplied = applications?.some((app: any) => 
    String(app.applicantId?._id || app.applicantId) === String(currentUserId) || 
    String(app.userId?._id || app.userId) === String(currentUserId)
  );

  const onApplySubmit = (data: { message: string }) => {
    setIsApplying(true);
    applyMutation.mutate({ 
      opportunityId: id, 
      message: data.message.trim() || undefined 
    });
  };

  const handleReview = (applicationId: string, status: "accepted" | "rejected") => {
    reviewMutation.mutate({ id: applicationId, payload: { status } });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center border-b border-slate-100 z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full bg-slate-50">
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text className="font-outfit-bold text-lg text-slate-900 ml-4">Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {apiError ? (
          <View className="mx-5 mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <Text className="font-outfit-medium text-red-500 text-sm">{apiError}</Text>
          </View>
        ) : null}

        {/* Core Detail Component */}
        <View className="p-5 border-b border-slate-100 bg-[#F8FAFC]">
          <View className="flex-row items-start justify-between mb-2">
            <Text className="font-outfit-bold text-2xl text-slate-900 flex-1 pr-4 leading-tight">
              {opportunity.title}
            </Text>
            <View className="items-end gap-2">
              <View className={`px-3 py-1.5 rounded-md ${isClosed || isExpired ? "bg-slate-200" : "bg-sky-100"}`}>
                <Text className={`font-outfit-medium text-xs uppercase tracking-widest ${isClosed || isExpired ? "text-slate-600" : "text-sky-600"}`}>
                  {isClosed ? opportunity.status : (isExpired ? "expired" : opportunity.status)}
                </Text>
              </View>
              {opportunity.shootType && (
                <View className="px-3 py-1.5 rounded-md bg-[#2575FC]/10 border border-[#2575FC]/20">
                  <Text className="font-outfit-medium text-xs uppercase tracking-widest text-[#2575FC]">
                    {opportunity.shootType}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="flex-row items-center mt-3 gap-5">
            <View className="flex-row items-center gap-2">
              <Calendar size={16} color="#64748B" />
              <Text className="font-outfit-medium text-sm text-slate-600">
                {new Date(opportunity.startDate).toLocaleDateString()} - {new Date(opportunity.endDate).toLocaleDateString()}
              </Text>
            </View>
            <View className="flex-row items-center gap-2 flex-1">
              <MapPin size={16} color="#64748B" />
              <Text className="font-outfit-medium text-sm text-slate-600" numberOfLines={1}>{opportunity.location}</Text>
            </View>
          </View>

          <View className="mt-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <Text className="font-outfit-medium text-sm text-slate-400 mb-2 uppercase tracking-wider">Description</Text>
            <Text className="font-outfit text-base text-slate-700 leading-relaxed">
              {opportunity.description}
            </Text>
          </View>

          {opportunity.reference && opportunity.reference.length > 0 && (
            <View className="mt-8 px-1">
              <Text className="font-outfit-bold text-lg text-slate-900 mb-3">Reference Media</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-4">
                {opportunity.reference.map((ref: any, idx: number) => (
                  <View key={idx} className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 justify-center items-center relative mr-3 shadow-sm">
                    <TouchableOpacity activeOpacity={0.9} className="w-full h-full relative" onPress={() => setSelectedPreview(ref)}>
                      {ref.mediaType === "photo" ? (
                        <Image source={{ uri: ref.url }} className="w-full h-full absolute" resizeMode="cover" />
                      ) : (
                        <View className="absolute inset-0 bg-slate-800 items-center justify-center">
                           <Video size={28} color="#FFF" />
                           <Text className="text-white font-outfit-medium text-[10px] mt-2 tracking-widest">VIDEO</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Dynamic Context Below */}
        <View className="p-5">
          {isOwner ? (
            <>
              <Text className="font-outfit-bold text-lg text-slate-900 mb-4">Applicants ({applications.length})</Text>
              {applications.length === 0 ? (
                <View className="py-10 items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <Text className="font-outfit-medium text-slate-400">No applications yet.</Text>
                </View>
              ) : (
                applications.map((app: any) => (
                  <ApplicationCard 
                    key={app._id} 
                    application={app} 
                    onReview={handleReview}
                    isReviewing={reviewMutation.isPending}
                  />
                ))
              )}
            </>
          ) : (
            <>
               <Text className="font-outfit-bold text-lg text-slate-900 mb-4">Creator Info</Text>
               <TouchableOpacity 
                 className="flex-row items-center bg-slate-50 p-4 rounded-2xl border border-slate-200"
                 activeOpacity={0.8}
                 onPress={() => {
                   if (creator?._id && currentUserId !== creator._id) {
                     router.push({ pathname: '/user/[id]' as any, params: { id: creator._id } });
                   }
                 }}
               >
                  <View className="w-12 h-12 rounded-full bg-slate-200 items-center justify-center overflow-hidden">
                    {creator?.profilePicture ? (
                      <Image source={{ uri: creator.profilePicture }} className="w-full h-full bg-slate-300" />
                    ) : (
                      <Text className="font-outfit-medium text-lg text-slate-500">
                        {creator?.fullName?.charAt(0) || "U"}
                      </Text>
                    )}
                  </View>
                  <View className="flex-1 ml-4 flex-row items-center justify-between">
                    <View>
                      <Text className="font-outfit-bold text-base text-slate-900">{creator?.fullName || "A Creator"}</Text>
                      <Text className="font-outfit text-sm text-slate-500">{creator?.role?.join(" • ") || "Creative"}</Text>
                    </View>
                    <ArrowLeft size={20} color="#CBD5E1" style={{ transform: [{ rotate: '180deg'}] }} />
                  </View>
               </TouchableOpacity>

                {hasApplied ? (
                  <View className="mt-8 p-5 rounded-2xl bg-emerald-50 border border-emerald-100 items-center">
                    <Text className="font-outfit-bold text-emerald-600 text-base">You've Applied!</Text>
                    <Text className="font-outfit-medium text-sm text-center text-emerald-600 mt-2">The creator will reach out if interested.</Text>
                  </View>
                ) : !isClosed && !isExpired && (
                 <View className="mt-8">
                   <View className="mb-6">
                     <Controller
                       control={control}
                       name="message"
                       render={({ field: { onChange, value } }) => (
                         <Input
                           variant="light"
                           label="Message to Creator"
                           placeholder="Why are you a great fit for this opportunity? (min 10 characters)"
                           value={value}
                           onChangeText={onChange}
                           error={errors.message?.message as string}
                           multiline
                           numberOfLines={4}
                           style={{ minHeight: 100, paddingTop: 16, textAlignVertical: 'top' }}
                         />
                       )}
                     />
                   </View>
                 </View>
               )}
            </>
          )}
        </View>
      </ScrollView>

      {(!isOwner && !isClosed && !isExpired && !hasApplied) ? (
        <View className="p-5 bg-white border-t border-slate-100 pb-8">
           <Button 
            title={isApplying ? "Applying..." : "Apply Now"} 
            onPress={handleSubmit(onApplySubmit)} 
            disabled={isApplying || applyMutation.isPending || !isValid}
            loading={applyMutation.isPending} 
           />
        </View>
      ) : (isOwner && !isClosed) ? (
        <View className="p-5 bg-white border-t border-slate-100 pb-8 items-center">
           <TouchableOpacity 
             className="px-6 py-4 border border-red-200 bg-red-50 rounded-full w-full items-center"
             onPress={() => cancelMutation.mutate(id)}
             disabled={cancelMutation.isPending}
           >
             <Text className="font-outfit-bold text-red-600 text-base">Cancel Opportunity</Text>
           </TouchableOpacity>
        </View>
      ) : null}

      <Modal visible={!!selectedPreview} animationType="fade" transparent>
        <View className="flex-1 bg-black/95 justify-center items-center">
          <TouchableOpacity 
            className="absolute top-12 right-6 z-50 w-10 h-10 bg-white/20 items-center justify-center rounded-full"
            onPress={() => setSelectedPreview(null)}
          >
            <Text className="text-white font-outfit-bold text-lg leading-none mt-[-2px]">✕</Text>
          </TouchableOpacity>
          {selectedPreview?.mediaType === "photo" ? (
            <ImagePreview url={selectedPreview?.url || ""} />
          ) : selectedPreview?.mediaType === "video" ? (
            <InlineVideoPlayer url={selectedPreview?.url || ""} />
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
