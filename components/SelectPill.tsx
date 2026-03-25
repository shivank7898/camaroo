import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Check } from "lucide-react-native";

interface SelectPillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  variant?: "dark" | "light";
}

/**
 * SelectPill
 * Toggle-style pill used in role selection and multi-select flows.
 *
 * Props:
 *   label    → display text
 *   selected → active state (filled ring + check icon)
 *   onPress  → toggle callback
 */
function SelectPill({ label, selected, onPress, variant = "dark" }: SelectPillProps) {
  const isLight = variant === "light";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`flex-row items-center justify-between p-5 mb-3 rounded-2xl border ${
        selected 
          ? (isLight ? "bg-[#d8b4fe] border-[#a855f7]" : "bg-secondary/20 border-secondary")
          : (isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10")
      }`}
    >
      <Text className={`font-outfit-medium text-lg ${
        selected 
          ? (isLight ? "text-black" : "text-white") 
          : (isLight ? "text-slate-500" : "text-text-secondary")
      }`}>
        {label}
      </Text>
      {selected ? (
        <Check size={20} color={isLight ? "#7e22ce" : "#6A11CB"} />
      ) : (
        <Text className={`${isLight ? "text-slate-300" : "text-white/20"} font-outfit text-lg`}>+</Text>
      )}
    </TouchableOpacity>
  );
}

export { SelectPill };
export default React.memo(SelectPill);
