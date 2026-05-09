import React from "react";
import { View, Text } from "react-native";
import { Bubble, BubbleProps, MessageText } from "react-native-gifted-chat";
import { Clock, Check, CheckCheck } from "lucide-react-native";
import type { GCMessage } from "@/types/chat";

export const MessageBubble = (props: BubbleProps<GCMessage>) => {
  const currentMessage = props.currentMessage as GCMessage;
  const isOwnMsg = props.position === "right";
  
  const status = currentMessage.status;

  const renderTicks = () => {
    if (!isOwnMsg) return null;
    
    switch (status) {
      case "sending":
        return <Clock size={12} color="#bae6fd" style={{ marginLeft: 4, marginTop: 2 }} />;
      case "sent":
        return <Check size={14} color="#bae6fd" style={{ marginLeft: 4, marginTop: 2 }} />;
      case "delivered":
        return <CheckCheck size={14} color="#bae6fd" style={{ marginLeft: 4, marginTop: 2 }} />;
      case "seen":
        return <CheckCheck size={14} color="#fde047" style={{ marginLeft: 4, marginTop: 2 }} />; // yellow tick on blue bubble for contrast
      case "failed":
        return <Text style={{ color: "#ef4444", fontSize: 10, marginLeft: 4 }}>Failed</Text>;
      default:
        // Assume sent if missing logic
        return <Check size={14} color="#bae6fd" style={{ marginLeft: 4, marginTop: 2 }} />;
    }
  };

  return (
    <View style={{ marginBottom: 4 }}>
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#f1f5f9", // slate-100
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 16,
            borderBottomLeftRadius: 4, // bubble tail
          },
          right: {
            backgroundColor: "#0ea5e9", // sky-500
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 16,
            borderBottomRightRadius: 4,
          },
        }}
        textStyle={{
          left: {
            fontFamily: "Outfit_400Regular",
            color: "#0f172a", // slate-900
            fontSize: 15,
          },
          right: {
            fontFamily: "Outfit_400Regular",
            color: "#ffffff",
            fontSize: 15,
          },
        }}
        renderTime={(timeProps) => (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", paddingHorizontal: 8, paddingBottom: 6 }}>
            <Text style={{ fontSize: 10, fontFamily: "Outfit_400Regular", color: isOwnMsg ? "#e0f2fe" : "#94a3b8" }}>
              {timeProps.currentMessage?.createdAt ? new Date(timeProps.currentMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
            </Text>
            {renderTicks()}
          </View>
        )}
      />
    </View>
  );
};
