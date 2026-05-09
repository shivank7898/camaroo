import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, TouchableOpacity, Easing, Platform } from "react-native";
import { useGlobalStore } from "@/store/globalStore";
import { CheckCircle, XCircle, Info } from "lucide-react-native";

export default function GlobalNotification() {
  const { toast, hideToast } = useGlobalStore();
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast?.visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [toast?.visible, slideAnim, opacityAnim, hideToast]);

  if (!toast) return null;

  const bgColors = {
    success: "#022c22", 
    error: "#450a0a", 
    info: "#0f172a", 
  };
  
  const borderColors = {
    success: "#10b981", 
    error: "#ef4444", 
    info: "#0ea5e9", 
  };

  const Icon = toast.type === "success" ? CheckCircle : toast.type === "error" ? XCircle : Info;
  const iconColor = borderColors[toast.type];

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
      pointerEvents={toast.visible ? "auto" : "none"}
    >
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={hideToast}
        style={[
          styles.toastBox, 
          { backgroundColor: bgColors[toast.type], borderColor: borderColors[toast.type] }
        ]}
      >
        <Icon size={20} color={iconColor} />
        <Text style={styles.text}>{toast.message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: "center",
  },
  toastBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  text: {
    color: "#fff",
    fontFamily: "Outfit-Medium",
    fontSize: 14,
    marginLeft: 10,
    flexShrink: 1,
  },
});
