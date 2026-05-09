import React from "react";
import { View, Platform } from "react-native";
import { InputToolbar, InputToolbarProps, Composer, Send } from "react-native-gifted-chat";
import { ArrowUp } from "lucide-react-native";
import type { GCMessage } from "@/types/chat";

export const ChatInputToolbar = (props: InputToolbarProps<GCMessage>) => {
  return (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        paddingTop: 6,
        paddingBottom: Platform.OS === "ios" ? 0 : 6,
        paddingHorizontal: 8,
      }}
      primaryStyle={{ alignItems: "flex-end" }}
      renderComposer={(composerProps) => (
        <Composer
          {...composerProps}
          textInputProps={{
            style: {
              backgroundColor: "#f8fafc",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: 10,
              fontFamily: "Outfit_400Regular",
              fontSize: 15,
              color: "#0f172a",
              marginRight: 8,
            }
          }}
          placeholder="Message..."
          placeholderTextColor="#94a3b8"
        />
      )}
      renderSend={(sendProps) => (
        <Send
          {...sendProps}
          containerStyle={{
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: sendProps.text?.trim() ? "#0ea5e9" : "#e2e8f0",
            borderRadius: 20,
            marginBottom: 4,
          }}
        >
          <ArrowUp size={20} color="#ffffff" />
        </Send>
      )}
    />
  );
};
