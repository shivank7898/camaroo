import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

export const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(dot1, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(() => animate());
    };

    animate();
    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, []);

  const getStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [
      {
        translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }),
      },
    ],
  });

  return (
    <View className="flex-row justify-start mb-4 px-4 w-full mt-2">
      <View className="bg-slate-100 rounded-full px-4 py-3 flex-row items-center min-w-[60px] justify-between">
        <Animated.View className="w-2 h-2 rounded-full bg-slate-400" style={getStyle(dot1)} />
        <Animated.View className="w-2 h-2 rounded-full bg-slate-400 mx-1" style={getStyle(dot2)} />
        <Animated.View className="w-2 h-2 rounded-full bg-slate-400" style={getStyle(dot3)} />
      </View>
    </View>
  );
};
