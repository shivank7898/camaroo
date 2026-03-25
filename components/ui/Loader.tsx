import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

interface LoaderProps {
  color?: string;
  size?: number;
}

const Loader = ({ color = "#FFFFFF", size = 10 }: LoaderProps) => {
  const dot1 = useRef(new Animated.Value(-3 * size)).current;
  const dot2 = useRef(new Animated.Value(-3 * size)).current;
  const dot3 = useRef(new Animated.Value(-3 * size)).current;

  useEffect(() => {
    const gap = size * 1.5;

    const animate = () => {
      // Reset
      dot1.setValue(-3 * gap);
      dot2.setValue(-3 * gap);
      dot3.setValue(-3 * gap);

      Animated.sequence([
        // 0-16.67%: dot3 slides in from right
        Animated.timing(dot3, { toValue: gap, duration: 167, useNativeDriver: true }),
        // 16.67-33.33%: dot2 slides in to center
        Animated.timing(dot2, { toValue: 0, duration: 167, useNativeDriver: true }),
        // 33.33-40%: dot1 slides in from left  
        Animated.timing(dot1, { toValue: -gap, duration: 67, useNativeDriver: true }),
        // 40-60%: hold
        Animated.delay(200),
        // 60-66.67%: dot3 slides out right
        Animated.timing(dot3, { toValue: 3 * gap, duration: 67, useNativeDriver: true }),
        // 66.67-83.33%: dot2 slides out right
        Animated.timing(dot2, { toValue: 3 * gap, duration: 167, useNativeDriver: true }),
        // 83.33-100%: dot1 slides out right
        Animated.timing(dot1, { toValue: 3 * gap, duration: 167, useNativeDriver: true }),
      ]).start(() => animate());
    };

    animate();
  }, []);

  const dotStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    position: "absolute" as const,
  };

  return (
    <View style={[styles.container, { width: size * 5, height: size }]}>
      <Animated.View style={[dotStyle, { transform: [{ translateX: dot1 }] }]} />
      <Animated.View style={[dotStyle, { transform: [{ translateX: dot2 }] }]} />
      <Animated.View style={[dotStyle, { transform: [{ translateX: dot3 }] }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    alignSelf: "center",
  },
});

export default React.memo(Loader);
export { Loader };
