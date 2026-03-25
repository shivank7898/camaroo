import React from "react";
import { LinearGradient } from "expo-linear-gradient";

interface TopGradientFadeProps {
  height?: number;
}

/**
 * TopGradientFade
 * Global top-of-screen gradient that fades from brand blue → transparent.
 * Pure presentational — no logic. Used on Home, Profile, and User Detail screens.
 *
 * Props:
 *   height? → gradient height in px (default: 160)
 */
function TopGradientFade({ height = 160 }: TopGradientFadeProps) {
  return (
    <LinearGradient
      colors={["#5b8fbc", "rgba(26,43,76,0.3)", "rgba(255,255,255,0)"]}
      locations={[0, 0.6, 1]}
      style={{ position: "absolute", top: 0, left: 0, right: 0, height, zIndex: 0 }}
    />
  );
}

export default React.memo(TopGradientFade);
