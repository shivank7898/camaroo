import React from "react";
import { Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface GlareShimmerProps {
  glareAnim: Animated.Value;
}

/**
 * GlareShimmer
 * One-time animated glare/sheen effect that sweeps across a card.
 * Pure presentational — receives the animated value from useAuthAnimation.
 * pointerEvents: 'none' so it never blocks touches.
 *
 * Props:
 *   glareAnim → Animated.Value for translateX (from useAuthAnimation)
 */
function GlareShimmer({ glareAnim }: GlareShimmerProps) {
  return (
    <Animated.View
      style={{
        position: "absolute",
        top: -100,
        left: 0,
        bottom: -100,
        width: "150%",
        transform: [{ translateX: glareAnim }, { rotate: "45deg" }],
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <LinearGradient
        colors={[
          "transparent",
          "rgba(255,255,255,0.02)",
          "rgba(255,255,255,0.08)",
          "rgba(255,255,255,0.02)",
          "transparent",
        ]}
        locations={[0, 0.3, 0.5, 0.7, 1]}
        style={{ width: "100%", height: "100%" }}
      />
    </Animated.View>
  );
}

export default React.memo(GlareShimmer);
