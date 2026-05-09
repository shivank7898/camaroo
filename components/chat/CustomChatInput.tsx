import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Send, Plus, Image as ImageIcon, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

interface CustomChatInputProps {
  onSend: (text: string, attachment?: { uri: string; mimeType: string; fileName: string }) => void;
  onTyping: (text: string) => void;
  isUploading?: boolean;
}

export function CustomChatInput({ onSend, onTyping, isUploading }: CustomChatInputProps) {
  const [text, setText] = useState("");
  const [draftAttachment, setDraftAttachment] = useState<{uri: string, mimeType: string, fileName: string} | null>(null);
  const insets = useSafeAreaInsets();

  const handleSend = () => {
    if (text.trim().length > 0 || draftAttachment) {
      onSend(text.trim(), draftAttachment || undefined);
      setText("");
      setDraftAttachment(null);
      onTyping("");
    }
  };

  const handleChangeText = (val: string) => {
    setText(val);
    onTyping(val);
  };

  return (
    <View 
      className="border-t border-slate-100 bg-white"
      style={{ paddingBottom: Math.max(insets.bottom, 12), paddingTop: 10, paddingHorizontal: 12 }}
    >
      {/* Draft Attachment Preview */}
      {draftAttachment && (
        <View className="mb-3">
          <View className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 relative ml-[54px]">
            <Image source={{ uri: draftAttachment.uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setDraftAttachment(null)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/60 items-center justify-center"
            >
              <X size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View className="flex-row items-end gap-2">
        {/* Attachment Button */}
        <TouchableOpacity 
          activeOpacity={0.8}
          disabled={isUploading}
          onPress={async () => {
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: false,
              quality: 0.8,
            });
            if (!res.canceled && res.assets[0]) {
              const uri = res.assets[0].uri;
              const fileName = uri.split('/').pop() || "image.jpg";
              const ext = fileName.split('.').pop()?.toLowerCase();
              const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
              setDraftAttachment({ uri, mimeType, fileName });
            }
          }}
          className="w-[46px] h-[46px] rounded-full bg-slate-100 border border-slate-200 items-center justify-center mb-0.5"
        >
          {isUploading ? <ActivityIndicator size="small" color="#0ea5e9" /> : <ImageIcon size={22} color="#64748B" />}
        </TouchableOpacity>

        {/* Input Pill */}
        <View className="flex-1 bg-slate-50/80 rounded-3xl border border-slate-200 flex-row items-center px-4 py-1 min-h-[46px] max-h-[120px]">
          <TextInput
            multiline
            placeholder="Message..."
            placeholderTextColor="#94a3b8"
            value={text}
            onChangeText={handleChangeText}
            className="flex-1 font-outfit text-[16px] text-slate-800 pt-3 pb-3"
            style={{ textAlignVertical: "center", lineHeight: 20 }}
          />
        </View>

        {/* Circular Send Button Outside the Pill */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={handleSend}
          disabled={text.trim().length === 0 && !draftAttachment}
          className="mb-0.5 shadow-sm"
          style={{ width: 46, height: 46, borderRadius: 23, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={(text.trim().length > 0 || draftAttachment) ? ["#6A11CB", "#2575FC"] : ["#E2E8F0", "#F1F5F9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
          />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Send 
              size={20} 
              color={(text.trim().length > 0 || draftAttachment) ? "#FFFFFF" : "#64748B"} 
              style={{ paddingLeft: 2 }} 
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
