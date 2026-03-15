import { View, ViewProps } from "react-native";

export function Card({ children, className = "", ...props }: ViewProps) {
  return (
    <View className={`bg-card rounded-2xl p-6 border border-card-border ${className}`} {...props}>
      {children}
    </View>
  );
}

