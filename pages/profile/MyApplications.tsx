import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopGradientFade from "@components/ui/TopGradientFade";
import { useMyApplications } from "@/hooks/useMyApplications";
import { OpportunityCard } from "@/components/opportunity/OpportunityCard";

const STATUS_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  accepted: { bg: "#ecfdf5", border: "#a7f3d0", text: "#059669", label: "Accepted" },
  rejected:  { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", label: "Rejected" },
  cancelled: { bg: "#f8fafc", border: "#cbd5e1", text: "#64748b", label: "Cancelled" },
  pending:   { bg: "#fffbeb", border: "#fde68a", text: "#d97706", label: "Pending" },
};

export default function MyApplications() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { applications, isLoading } = useMyApplications(undefined, true);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopGradientFade />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 12, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", marginRight: 4 }}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={{ fontFamily: "Outfit_700Bold", fontSize: 20, color: "#000" }}>My Applications</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: (insets.bottom || 0) + 40, paddingTop: 16 }}
        >
          {isLoading ? (
            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 60, opacity: 0.6 }}>
              <Text style={{ fontFamily: "Outfit_500Medium", color: "#64748b" }}>Loading...</Text>
            </View>
          ) : applications.length === 0 ? (
            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 60, borderWidth: 1.5, borderStyle: "dashed", borderColor: "#e2e8f0", borderRadius: 16, backgroundColor: "#f8fafc" }}>
              <Text style={{ fontFamily: "Outfit_500Medium", color: "#94a3b8", fontSize: 14 }}>You haven't applied to any opportunities yet.</Text>
            </View>
          ) : (
            applications.map((app: any) => {
              const s = STATUS_STYLES[app.status] || STATUS_STYLES.pending;
              return (
                <View key={app._id} style={{ marginBottom: 16 }}>
                  {/* Status + Applied date row */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6, paddingHorizontal: 4 }}>
                    <Text style={{ fontFamily: "Outfit_400Regular", fontSize: 11, color: "#94a3b8" }}>
                      {(() => { const d = new Date(app.appliedAt); const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return isNaN(d.getTime()) ? "" : `Applied ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; })()}
                    </Text>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1, backgroundColor: s.bg, borderColor: s.border }}>
                      <Text style={{ fontFamily: "Outfit_700Bold", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, color: s.text }}>
                        {s.label}
                      </Text>
                    </View>
                  </View>

                  <OpportunityCard
                    opportunity={{
                      ...(app.opportunityData || {}),
                      startDate: app.opportunityData?.startDate || new Date().toISOString(),
                      endDate: app.opportunityData?.endDate || new Date().toISOString(),
                      userData: app.ownerData || {},
                    }}
                    onPress={(id) => router.push({ pathname: "/opportunity/[id]" as any, params: { id } })}
                  />

                  {/* Message snippet */}
                  {app.message ? (
                    <View style={{ marginTop: 4, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#f8fafc", borderRadius: 10, borderWidth: 1, borderColor: "#f1f5f9" }}>
                      <Text style={{ fontFamily: "Outfit_400Regular", fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
                        "{app.message}"
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
