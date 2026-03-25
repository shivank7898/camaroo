import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";
import { Loader } from "./ui/Loader";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "danger";
  loading?: boolean;
}

/**
 * Button
 * General-purpose button component.
 *
 * Variants:
 *   primary  → filled dark (#1E293B bg, white text)
 *   secondary → light slate fill
 *   outline  → transparent with border
 *   danger   → red tinted fill for destructive actions
 */
function Button({ title, variant = "primary", className = "", loading, ...props }: ButtonProps) {
  const variantStyles: Record<string, { bg: string; text: string }> = {
    primary:   { bg: "bg-[#1E293B]",                         text: "text-white" },
    secondary: { bg: "bg-slate-100",                          text: "text-[#1E293B]" },
    outline:   { bg: "bg-transparent border border-slate-300", text: "text-[#1E293B]" },
    danger:    { bg: "bg-red-50 border border-red-200",        text: "text-red-600" },
  };

  const { bg, text } = variantStyles[variant] ?? variantStyles.primary;

  return (
    <TouchableOpacity
      className={`px-8 py-4 rounded-full items-center justify-center ${bg} ${className}`}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader color={text.replace("text-", "").replace("[", "").replace("]", "") === "white" ? "#FFFFFF" : "#1E293B"} />
      ) : (
        <Text className={`font-outfit-bold text-base ${text}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export { Button };
export default React.memo(Button);
