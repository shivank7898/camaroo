import { TouchableOpacity, Text } from "react-native";
import { Check } from "lucide-react-native";

interface SelectPillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function SelectPill({ label, selected, onPress }: SelectPillProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`flex-row items-center justify-between p-5 mb-3 rounded-2xl border ${
        selected ? 'bg-secondary/20 border-secondary' : 'bg-white/5 border-white/10'
      }`}
    >
      <Text className={`font-outfit-medium text-lg ${selected ? 'text-white' : 'text-text-secondary'}`}>
        {label}
      </Text>
      {selected ? (
        <Check size={20} color="#6A11CB" />
      ) : (
        <Text className="text-white/20 font-outfit text-lg">+</Text>
      )}
    </TouchableOpacity>
  );
}
