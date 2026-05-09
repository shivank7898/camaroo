import React, { memo } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Check, X, User } from "lucide-react-native";
import type { OpportunityApplication } from "@/types/opportunity";

interface ApplicationCardProps {
  application: OpportunityApplication;
  onReview: (id: string, status: "accepted" | "rejected") => void;
  isReviewing?: boolean;
}

const ApplicationCardComponent = ({ application, onReview, isReviewing }: ApplicationCardProps) => {
  const {
    _id,
    message,
    status,
    applicantId,
    userId,
    appliedAt,
  } = application;

  const applicant = (userId as any) || (applicantId as any) || {}; 
  const appliedDate = new Date(appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const isPending = status === "pending";

  return (
    <View className="bg-white rounded-3xl p-4 mb-3 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <View className="flex-row items-center mb-3">
        {applicant.profilePicture ? (
          <Image source={{ uri: applicant.profilePicture }} className="w-10 h-10 rounded-full bg-slate-100" />
        ) : (
          <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center">
            <User size={18} color="#64748B" />
          </View>
        )}
        <View className="flex-1 ml-3">
          <Text className="font-outfit-bold text-sm text-slate-900 leading-tight">
            {applicant.fullName || "Applicant"}
          </Text>
          <Text className="font-outfit text-xs text-slate-500 mt-0.5">Applied {appliedDate}</Text>
        </View>
        {!isPending && (
          <View className={`px-2 py-1 rounded-md ${status === "accepted" ? "bg-green-50" : "bg-red-50"}`}>
            <Text className={`font-outfit-medium text-[10px] uppercase tracking-wider ${status === "accepted" ? "text-green-600" : "text-red-500"}`}>
              {status}
            </Text>
          </View>
        )}
      </View>

      {message ? (
        <View className="bg-slate-50 rounded-xl p-3 mb-4 overflow-hidden">
          <Text className="font-outfit text-sm text-slate-700 leading-relaxed italic" style={{ flexShrink: 1 }}>"{message}"</Text>
        </View>
      ) : null}

      {isPending && (
        <View className="flex-row items-center justify-end gap-3 mt-1">
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isReviewing}
            onPress={() => onReview(_id, "rejected")}
            className="px-4 py-2 rounded-full border border-slate-200 bg-white opacity-80"
          >
            <Text className="font-outfit-medium text-xs text-slate-600">Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isReviewing}
            onPress={() => onReview(_id, "accepted")}
            className="flex-row items-center gap-1.5 px-4 py-2 rounded-full bg-sky-500"
          >
            <Check size={14} color="#FFF" />
            <Text className="font-outfit-medium text-xs text-white">Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export const ApplicationCard = memo(ApplicationCardComponent);
