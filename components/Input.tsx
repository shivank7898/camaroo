import { TextInput, TextInputProps, View, Text } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <View className={`w-full ${className}`}>
      {label && <Text className="text-xs font-outfit-medium text-text-secondary mb-2 ml-1 tracking-wider uppercase">{label}</Text>}
      <TextInput
        className="bg-white/10 border border-white/15 rounded-xl px-5 py-4 font-outfit text-white text-base"
        placeholderTextColor="rgba(148,163,184,0.6)"
        {...props}
      />
    </View>
  );
}

