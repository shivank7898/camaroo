import { useRef, useEffect } from "react";
import { Animated } from "react-native";

/**
 * useAuthAnimation
 * Shared animation hook for Login and Signup screens.
 * Encapsulates all 6 animated values and the entrance + glare sequence.
 *
 * Returns:
 *   slideAnimRight → use for elements that slide in from the right
 *   slideAnimLeft  → use for elements that slide in from the left
 *   fadeAnim       → opacity fade for form fields
 *   btnSlideAnim   → button slide up (Y axis)
 *   btnFadeAnim    → button opacity fade
 *   glareAnim      → one-time glare shimmer translateX
 */
export function useAuthAnimation() {
  const slideAnimRight = useRef(new Animated.Value(50)).current;
  const slideAnimLeft = useRef(new Animated.Value(-50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const btnSlideAnim = useRef(new Animated.Value(50)).current;
  const btnFadeAnim = useRef(new Animated.Value(0)).current;
  const glareAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    // Step 1: Entrance animation — all elements slide + fade in together
    Animated.parallel([
      Animated.timing(slideAnimRight, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnimLeft, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(btnSlideAnim, { toValue: 0, duration: 800, delay: 200, useNativeDriver: true }),
      Animated.timing(btnFadeAnim, { toValue: 1, duration: 800, delay: 200, useNativeDriver: true }),
    ]).start(() => {
      // Step 2: Glare shimmer fires after entrance completes
      Animated.timing(glareAnim, {
        toValue: 600,
        duration: 800,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  return { slideAnimRight, slideAnimLeft, fadeAnim, btnSlideAnim, btnFadeAnim, glareAnim };
}
