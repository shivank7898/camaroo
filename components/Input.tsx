import React from "react";
import { TextInput, TextInputProps, View, Text } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  variant?: "light" | "dark";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  error?: string;
}

function Input({ label, variant = "dark", className = "", startIcon, endIcon, error, ...props }: InputProps) {
  const isLight = variant === "light";
  
  return (
    <View className={`w-full ${className}`}>
      {label && <Text className="text-xs font-outfit-medium text-text-secondary mb-2 ml-1 tracking-wider uppercase">{label}</Text>}
      <View
        className={`flex-row items-center border rounded-xl px-4 py-4 ${
          isLight 
            ? "bg-slate-50 border-slate-200" 
            : "bg-white/10"
        } ${error ? 'border-red-500' : 'border-white/15'}`}
      >
        {startIcon && <View className="mr-3">{startIcon}</View>}
        <TextInput
          className={`flex-1 font-outfit text-base p-0 m-0 ${isLight ? "text-black" : "text-white"}`}
          placeholderTextColor={isLight ? "rgba(100,116,139,0.6)" : "rgba(148,163,184,0.6)"}
          {...props}
        />
        {endIcon && <View className="ml-3">{endIcon}</View>}
      </View>
      {error && <Text className="text-red-500 text-xs font-outfit mt-1 ml-1">{error}</Text>}
    </View>
  );
}

export default React.memo(Input);
export { Input };

