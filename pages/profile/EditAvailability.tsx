import React, { useState, useCallback, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Globe, Lock, Briefcase } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import TopGradientFade from "@components/ui/TopGradientFade";
import CustomCalendar from "@components/ui/CustomCalendar";
import { Button } from "@components/Button";
import { Input } from "@components/Input";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCalendarQuery } from "@/services/queries";
import { updateAvailabilityMutation } from "@/services/mutations";
import { useAuthStore } from "@/store/authStore";

type DateStatus = "occupied" | "open";

interface DateDataNode {
  status: DateStatus;
  message?: string;
  opportunities?: any[];
}

export default function EditAvailability() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [datesDict, setDatesDict] = useState<Record<string, DateDataNode>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [apiError, setApiError] = useState("");
  const [calendarMonth, setCalendarMonth] = useState({ 
    month: new Date().getMonth() + 1, 
    year: new Date().getFullYear() 
  });

  const { data: calendarData, isLoading: isCalendarLoading } = useQuery({
    queryKey: ["calendar", user?.id, calendarMonth.month, calendarMonth.year],
    queryFn: () => getCalendarQuery({ userId: user?.id as string, month: calendarMonth.month, year: calendarMonth.year }),
    enabled: !!user?.id
  });

  const { mutate: updateAvailability, isPending: isUpdating } = useMutation({
    mutationFn: updateAvailabilityMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar", user?.id] });
      setSelectedDate(null);
      setApiError("");
    },
    onError: (err: any) => {
      let msg = "Failed to update availability.";
      try {
        msg = JSON.parse(err.message)?.message || err.message;
      } catch {
        msg = err.message || msg;
      }
      setApiError(msg);
    }
  });

  // Track the fetched dates locally
  useEffect(() => {
    if (calendarData) {
      const dict: Record<string, DateDataNode> = {};
      const list = Array.isArray(calendarData.dates) 
        ? calendarData.dates 
        : Array.isArray(calendarData) 
          ? calendarData 
          : [];
          
      list.forEach((d: any) => {
        if (!d.date) return;
        const dateStr = d.date.split("T")[0];
        dict[dateStr] = { 
          status: d.status || "open", 
          message: d.message, 
          opportunities: d.opportunities || []
        };
      });
      setDatesDict(prev => ({ ...prev, ...dict }));
    }
  }, [calendarData]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    
    // Map our DataNode dictionary to the CustomCalendar marker format
    Object.keys(datesDict).forEach(dateStr => {
      marks[dateStr] = {
        dateString: dateStr,
        status: datesDict[dateStr].status,
      };
    });
    return marks;
  }, [datesDict]);

  const handleMessageChange = useCallback((text: string) => {
    if (!selectedDate) return;
    setDatesDict(prev => {
      const existing = prev[selectedDate] || { status: "open", opportunities: [] };
      return {
        ...prev,
        [selectedDate]: { ...existing, message: text }
      };
    });
  }, [selectedDate]);

  const handleSave = () => {
    if (!selectedDate) return;
    setApiError("");
    const data = datesDict[selectedDate] || { status: "open", message: "" };
    
    // We send the precise ISO format expected by POST /me/self-occupied
    updateAvailability({ 
      date: `${selectedDate}T00:00:00.000Z`, 
      message: data.message || "" 
    });
  };

  return (
    <View className="flex-1 bg-white">
      <TopGradientFade />

      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-5 py-3 flex-row items-center justify-between border-b border-black/5">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="w-11 h-11 items-center justify-center mr-1"
            >
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text className="font-outfit-bold text-xl text-black">Personal Calendar</Text>
          </View>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 px-5 pt-6 pb-6" showsVerticalScrollIndicator={false}>
            <View className="flex-1">
              <Text className="font-outfit-bold text-2xl text-black mb-2">Manage Schedule</Text>
              <Text className="font-outfit text-slate-500 mb-6">Select a date to open or block your availability.</Text>

              {/* Custom Gradient Calendar Container */}
            <LinearGradient
              colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.7)"]}
              className="rounded-3xl border border-slate-100 overflow-hidden mb-6 shadow-sm"
            >
              <CustomCalendar 
                markedDates={markedDates}
                selectedDate={selectedDate}
                onDayPress={(day: string) => setSelectedDate(day)}
                isLoading={isCalendarLoading}
                onMonthChange={(month, year) => setCalendarMonth({ month, year })}
              />
            </LinearGradient>

            {/* Bottom Edit Panel */}
            {selectedDate && (() => {
              const data = datesDict[selectedDate] || { status: "open", opportunities: [] };
              const isOccupied = data.status === "occupied";
              
              return (
                <View className="bg-slate-50 rounded-3xl border border-slate-200 p-5 mb-8">
                  <View className="flex-row items-center justify-between mb-6">
                    <Text className="font-outfit-bold text-lg text-black">{selectedDate}</Text>
                    
                    {isOccupied && (
                      <View className="flex-row items-center bg-sky-50 border border-sky-100 rounded-full px-3 py-1.5">
                        <Lock size={14} color="#0EA5E9" />
                        <Text className="font-outfit-medium text-xs ml-1.5 text-[#0EA5E9]">
                          Busy
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text className="font-outfit-medium text-sm text-slate-500 mb-2 ml-1">Optional Message</Text>
                  <View className="w-full bg-white rounded-2xl border border-slate-200 px-4 py-3 min-h-[80px] mb-6">
                    <Input 
                      variant="light"
                      placeholder="e.g., Traveling, Personal Work" 
                      value={data.message || ""} 
                      onChangeText={handleMessageChange}
                      editable={!isUpdating}
                      multiline
                      style={{ minHeight: 40, textAlignVertical: "top", padding: 0 }}
                    />
                  </View>

                  <Text className="font-outfit-bold text-base text-black mb-3">Linked Opportunities</Text>
                  {data.opportunities && data.opportunities.length > 0 ? (
                    data.opportunities.map((opp: any, idx: number) => (
                      <View key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 flex-row items-center mb-0">
                        <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3">
                          <Briefcase size={18} color="#0EA5E9" />
                        </View>
                        <View className="flex-1">
                          <Text className="font-outfit-bold text-sm text-black mb-0.5">{opp.title}</Text>
                          <Text className="font-outfit-medium text-xs text-slate-500">{opp.location}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text className="font-outfit-medium text-sm text-slate-400 italic mt-1 mb-2">
                      No connected opportunities.
                    </Text>
                  )}
                </View>
              );
            })()}
            </View>

            {/* Save Button */}
            <View className="pb-8 pt-4">
              {apiError ? <Text className="text-red-500 font-outfit-medium mb-4">{apiError}</Text> : null}
              <Button 
                title="Save Availability" 
                loading={isUpdating}
                onPress={handleSave} 
                disabled={isUpdating || !selectedDate} 
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
