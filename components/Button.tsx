import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline";
}

export function Button({ title, variant = "primary", className = "", ...props }: ButtonProps) {
  let bgClass = "bg-primary";
  let textClass = "text-white";

  if (variant === "secondary") {
    bgClass = "bg-slate-100";
    textClass = "text-text-primary";
  } else if (variant === "outline") {
    bgClass = "bg-transparent border border-gray-300";
    textClass = "text-text-primary";
  }

  return (
    <TouchableOpacity
      className={`px-8 py-4 rounded-full items-center justify-center ${bgClass} ${className}`}
      activeOpacity={0.8}
      {...props}
    >
      <Text className={`font-outfit-bold text-lg ${textClass}`}>{title}</Text>
    </TouchableOpacity>
  );
}
