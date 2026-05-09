import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, Modal, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react-native";

import { createOpportunitySchema, type CreateOpportunityFormValues } from "@/validations/opportunity";
import { createOpportunityMutation } from "@/services/mutations";
import Input from "@/components/Input";
import Button from "@/components/Button";
import CustomCalendar from "@/components/ui/CustomCalendar";
import { SearchablePicker } from "@/components/ui/SearchablePicker";
import { useLocationPicker } from "@/hooks/useLocationPicker";
import * as ImagePicker from "expo-image-picker";
import { uploadFileTracked } from "@/services/upload";
import { getUploadUrlMutation } from "@/services/mutations";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useAuthStore } from "@/store/authStore";
import { Image } from "react-native";
import { Camera, Video } from "lucide-react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useGlobalStore } from "@/store/globalStore";

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

export default function CreateOpportunity() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [apiError, setApiError] = useState("");
  const { showToast } = useGlobalStore();
  const [uploadingMediaIndex, setUploadingMediaIndex] = useState<number | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<{url: string, mediaType: string} | null>(null);
  
  const user = useAuthStore(s => s.user);

  // Hidden mapping triggers
  const mockCountry = "IN";
  const [selectedState, setSelectedState] = useState<string>("");
  const { stateItems, cityItems, statesLoading, citiesLoading } = useLocationPicker(mockCountry, selectedState);

  const specOptions = ["Wedding", "Fashion", "Commercial", "Portrait", "Events", "Product"];

  const {
    control,
    handleSubmit,
    formState,
    watch,
    setValue,
  } = useForm<CreateOpportunityFormValues>({
    resolver: zodResolver(createOpportunitySchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      location: "",
      startDate: "",
      endDate: "",
      shootType: "",
      reference: [],
    },
  });

  const referencesParam = watch("reference") || [];
  const currentShootType = watch("shootType");

  const handlePickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0] && user?.id) {
      const asset = result.assets[0];
      const isVideo = asset.type === "video";
      const fileUri = asset.uri;
      const fileName = fileUri.split("/").pop() || (isVideo ? "ref.mp4" : "ref.jpg");

      setUploadingMediaIndex(referencesParam.length);
      
      try {
        const contentType = isVideo ? "video/mp4" : "image/jpeg";
        const meta = isVideo ? "video" : "image";
        const res = await getUploadUrlMutation({ mediaType: meta, fileName, contentType });
        if (!res?.uploadUrl) throw new Error("No upload URL returned.");
        
        await uploadFileTracked(fileUri, res.uploadUrl, contentType);
        const finalUrl = res.fileUrl || res.uploadUrl.split("?")[0];
        
        const freshRefs = [...referencesParam, { name: fileName, url: finalUrl, mediaType: isVideo ? "video" : "photo" }];
        control._formValues.reference = freshRefs;
      } catch (e: any) {
        setApiError("Failed to upload media. Please try again.");
      } finally {
        setUploadingMediaIndex(null);
      }
    }
  };

  const removeMedia = (index: number) => {
    const newRefs = [...referencesParam];
    newRefs.splice(index, 1);
    setValue("reference", newRefs, { shouldValidate: true });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: createOpportunityMutation,
    onSuccess: () => {
      showToast("Opportunity created successfully!", "success");
      setApiError("");
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["myOpportunities"] });
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
      queryClient.refetchQueries({ queryKey: ["opportunities"], exact: false, type: "active" });
      setTimeout(() => {
        router.replace({ pathname: "/profile", params: { tab: "opportunities" } });
      }, 600);
    },
    onError: (error: any) => {
      setApiError(error.message || "Failed to create opportunity");
    },
  });

  const onSubmit = (data: CreateOpportunityFormValues) => {
    try {
      const isoStart = new Date(data.startDate).toISOString();
      const isoEnd = new Date(data.endDate).toISOString();

      const payload: any = {
        ...data,
        startDate: isoStart,
        endDate: isoEnd,
        status: "open",
      };

      if (payload.reference && payload.reference.length === 0) {
        delete payload.reference;
      }

      mutate(payload);
    } catch (e) {
      setApiError("Invalid date format. Please check your selected dates.");
    }
  };

  // Account for local timezone when generating the Date strings vs UTC
  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

  const startDateValue = watch("startDate");
  const endDateMinDate = (() => {
    if (!startDateValue) return todayStr;
    const d = new Date(startDateValue);
    d.setDate(d.getDate() + 1); // Next day after start
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  })();
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="px-5 py-4 flex-row items-center justify-between border-b border-slate-100 bg-white z-10">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full bg-slate-50">
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text className="font-outfit-bold text-lg text-slate-900 flex-1 ml-4">Post Opportunity</Text>
        </View>

        <KeyboardAwareScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={Platform.OS === 'ios' ? 20 : 60}
        >
          {apiError ? (
            <View className="mb-6 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <Text className="font-outfit-medium text-red-500 text-sm">{apiError}</Text>
            </View>
          ) : null}

          <Text className="font-outfit text-sm text-slate-500 mb-6">
            Fill out the details to post a new hiring or collaboration opportunity to the board.
          </Text>

          <View className="mb-4">
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  variant="light"
                  label="Job Title / Requirement"
                  placeholder="e.g. Wedding Photographer Needed"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={formState.errors.title?.message}
                />
              )}
            />
          </View>

          <View className="mb-4">
            <SearchablePicker
              variant="light"
              label="State *"
              placeholder="Select State"
              items={stateItems}
              value={selectedState || null}
              onValueChange={(val) => {
                setSelectedState(val || "");
                setValue("location", "", { shouldValidate: true });
              }}
              disabled={statesLoading || isPending}
            />
          </View>

          <View className="mb-4">
            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, value } }) => (
                <SearchablePicker
                  variant="light"
                  label="City *"
                  placeholder="Select City"
                  items={cityItems}
                  value={value || null}
                  onValueChange={(val) => onChange(val || "")}
                  disabled={citiesLoading || isPending}
                  error={formState.errors.location?.message}
                />
              )}
            />
          </View>
          
          <View className="mb-4">
            <Text className="font-outfit-medium text-sm text-slate-700 mb-2 ml-1">Shoot Type *</Text>
            <View className="flex-row flex-wrap gap-2">
               {specOptions.map((spec) => (
                 <TouchableOpacity
                   key={spec}
                   onPress={() => setValue("shootType", spec, { shouldValidate: true })}
                   disabled={isPending}
                   className={`border rounded-full px-4 py-2 ${currentShootType === spec ? 'bg-[#2575FC] border-[#2575FC]' : 'bg-slate-50 border-slate-200'}`}
                 >
                   <Text className={`font-outfit text-sm ${currentShootType === spec ? 'text-white' : 'text-slate-600'}`}>
                     {spec}
                   </Text>
                 </TouchableOpacity>
               ))}
            </View>
            {formState.errors.shootType && (
              <Text className="text-red-500 font-outfit text-xs mt-1 ml-1">{formState.errors.shootType.message}</Text>
            )}
          </View>

          <View className="flex-row gap-3 mb-4 z-50">
            <View className="flex-1">
              <Controller
                control={control}
                name="startDate"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => setShowStartCalendar(true)}>
                      <View pointerEvents="none">
                        <Input
                          variant="light"
                          label="Start Date"
                          placeholder="Select Date"
                          value={value}
                          error={formState.errors.startDate?.message}
                          editable={false}
                        />
                      </View>
                    </TouchableOpacity>
                    <Modal visible={showStartCalendar} animationType="fade" transparent>
                       <View className="flex-1 bg-black/50 justify-center items-center px-4">
                          <View className="bg-white w-full rounded-3xl p-5 shadow-lg max-h-[80%]">
                            <Text className="font-outfit-bold text-xl text-slate-900 mb-4 text-center">Start Date</Text>
                            <CustomCalendar 
                               markedDates={{}}
                               selectedDate={value || null}
                               onDayPress={(d: string) => { onChange(d); setShowStartCalendar(false); }}
                               minDate={todayStr}
                            />
                            <TouchableOpacity className="mt-4 p-3 bg-slate-100 rounded-full" onPress={() => setShowStartCalendar(false)}>
                               <Text className="text-center font-outfit-bold text-slate-600">Cancel</Text>
                            </TouchableOpacity>
                          </View>
                       </View>
                    </Modal>
                  </View>
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={control}
                name="endDate"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => setShowEndCalendar(true)}>
                      <View pointerEvents="none">
                        <Input
                          variant="light"
                          label="End Date"
                          placeholder="Select Date"
                          value={value}
                          error={formState.errors.endDate?.message}
                          editable={false}
                        />
                      </View>
                    </TouchableOpacity>
                    <Modal visible={showEndCalendar} animationType="fade" transparent>
                       <View className="flex-1 bg-black/50 justify-center items-center px-4">
                          <View className="bg-white w-full rounded-3xl p-5 shadow-lg max-h-[80%]">
                            <Text className="font-outfit-bold text-xl text-slate-900 mb-4 text-center">End Date</Text>
                            <CustomCalendar 
                               markedDates={{}}
                               selectedDate={value || null}
                               onDayPress={(d: string) => { onChange(d); setShowEndCalendar(false); }}
                               minDate={endDateMinDate}
                            />
                            <TouchableOpacity className="mt-4 p-3 bg-slate-100 rounded-full" onPress={() => setShowEndCalendar(false)}>
                               <Text className="text-center font-outfit-bold text-slate-600">Cancel</Text>
                            </TouchableOpacity>
                          </View>
                       </View>
                    </Modal>
                  </View>
                )}
              />
            </View>
          </View>

          <View className="mb-2">
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  variant="light"
                  label="Description"
                  placeholder="Describe your requirements, duration, and other details..."
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  multiline
                  numberOfLines={6}
                  error={formState.errors.description?.message}
                  style={{ minHeight: 120, paddingTop: 16, textAlignVertical: 'top' }}
                />
              )}
            />
          </View>
          
          <View className="mb-6 z-0">
            <Text className="font-outfit-medium text-sm text-slate-700 mb-2 ml-1">Reference Media (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
              {referencesParam.map((ref: any, idx: number) => (
                <View key={idx} className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 justify-center items-center relative mr-3">
                  <TouchableOpacity activeOpacity={0.9} className="w-full h-full relative" onPress={() => setSelectedPreview(ref)}>
                    {ref.mediaType === "photo" ? (
                      <Image source={{ uri: ref.url }} className="w-full h-full absolute" resizeMode="cover" />
                    ) : (
                      <View className="absolute inset-0 bg-slate-800 items-center justify-center">
                         <Video size={24} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="absolute top-1.5 right-1.5 bg-black/60 w-6 h-6 rounded-full items-center justify-center z-10 p-0"
                    onPress={() => removeMedia(idx)}
                    hitSlop={{ top: 10, right: 10, left: 10, bottom: 10 }}
                  >
                    <Text className="text-white font-outfit-bold text-xs mt-[-2px]">✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={handlePickMedia} 
                disabled={uploadingMediaIndex !== null}
                className="w-24 h-24 rounded-2xl bg-slate-50 border border-dashed border-slate-300 items-center justify-center mr-3"
              >
                {uploadingMediaIndex !== null ? (
                  <ActivityIndicator color="#0ea5e9" size="small" />
                ) : (
                  <>
                    <Camera size={24} color="#94A3B8" />
                    <Text className="font-outfit text-[10px] text-slate-400 mt-2">Add Files</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAwareScrollView>

        {/* Footer stays inside KAV so keyboard avoidance works */}
        <View className="p-5 bg-white border-t border-slate-100">
          {apiError ? (
            <View className="mb-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <Text className="font-outfit-medium text-red-500 text-sm">{apiError}</Text>
            </View>
          ) : null}
          <Button
            title={uploadingMediaIndex !== null ? "Uploading Media..." : "Post Opportunity"}
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            disabled={isPending || uploadingMediaIndex !== null}
          />
        </View>

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
