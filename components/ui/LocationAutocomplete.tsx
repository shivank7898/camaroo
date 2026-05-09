import React, { useCallback, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Keyboard } from "react-native";
import { MapPin, X } from "lucide-react-native";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import type { PickedLocation, LocationSuggestion } from "@/types/auth";

interface LocationAutocompleteProps {
  label?: string;
  value: PickedLocation | null;
  onSelect: (loc: PickedLocation) => void;
  onClear?: () => void;
  variant?: "dark" | "light";
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

function LocationAutocompleteComponent({
  label,
  value,
  onSelect,
  onClear,
  variant = "dark",
  error,
  disabled = false,
  placeholder = "Search location..."
}: LocationAutocompleteProps) {
  const isLight = variant === "light";
  const [isFocused, setIsFocused] = useState(false);

  const {
    query,
    setQuery,
    suggestions,
    isSearching,
    isLoadingGPS,
    selectSuggestion,
    clearSelection,
    getCurrentLocation,
  } = useLocationSearch(onSelect, onClear);

  const handleClear = useCallback(() => {
    if (value) {
      clearSelection();
    } else {
      setQuery("");
    }
    Keyboard.dismiss();
  }, [value, clearSelection, setQuery]);

  const renderEndIcon = () => {
    if (isLoadingGPS) {
      return <ActivityIndicator size="small" color="#0EA5E9" />;
    }
    if (value !== null) {
      return (
        <TouchableOpacity onPress={handleClear} disabled={disabled} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <X size={20} color={isLight ? "#94A3B8" : "rgba(255,255,255,0.6)"} />
        </TouchableOpacity>
      );
    }
    if (query.length > 0) {
      return (
        <TouchableOpacity onPress={() => setQuery("")} disabled={disabled} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <X size={20} color={isLight ? "#94A3B8" : "rgba(255,255,255,0.6)"} />
        </TouchableOpacity>
      );
    }
    // Idle state
    return (
      <TouchableOpacity onPress={getCurrentLocation} disabled={disabled} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <MapPin size={20} color="#0EA5E9" />
      </TouchableOpacity>
    );
  };

  const renderSuggestion = useCallback(({ item }: { item: LocationSuggestion }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          selectSuggestion(item);
          Keyboard.dismiss();
          setIsFocused(false);
        }}
        className={`flex-row items-center px-4 py-3 border-b ${isLight ? 'border-slate-100 bg-white' : 'border-white/5 bg-[#0A1628]'}`}
        activeOpacity={0.7}
      >
        <MapPin size={18} color={isLight ? "#94A3B8" : "rgba(255,255,255,0.5)"} />
        <View className="ml-3 flex-1">
          <Text className={`font-outfit text-base ${isLight ? 'text-slate-800' : 'text-white'}`} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [isLight, selectSuggestion]);

  return (
    <View className="w-full mb-4 z-50">
      {label && (
        <Text className={`text-xs font-outfit-medium mb-2 ml-1 tracking-wider uppercase ${isLight ? 'text-slate-500' : 'text-text-secondary'}`}>
          {label}
        </Text>
      )}

      {/* Input Field / Chip */}
      <View
        className={`flex-row items-center border rounded-xl px-4 py-4 ${
          isLight ? "bg-slate-50" : "bg-white/10"
        } ${error ? 'border-red-500' : (isLight ? 'border-slate-200' : 'border-white/15')} ${disabled ? 'opacity-50' : ''}`}
      >
        <TextInput
          className={`flex-1 font-outfit text-base p-0 m-0 ${isLight ? "text-black" : "text-white"}`}
          placeholderTextColor={isLight ? "rgba(100,116,139,0.6)" : "rgba(148,163,184,0.6)"}
          placeholder={value ? "" : placeholder}
          value={value ? value.place : query}
          onChangeText={(text) => {
            if (!value) setQuery(text);
          }}
          editable={!disabled && value === null}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <View className="ml-3 flex-row items-center justify-center min-w-[24px]">
          {renderEndIcon()}
        </View>
      </View>

      {error && <Text className="text-red-500 text-xs font-outfit mt-1 ml-1">{error}</Text>}

      {/* Dropdown Suggestions */}
      {!value && isFocused && (query.length >= 3) && (
        <View className={`absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden shadow-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-[#0A1628] border-white/10'}`}>
          {isSearching ? (
             <View className="py-6 items-center justify-center">
               <ActivityIndicator size="small" color="#0EA5E9" />
             </View>
          ) : suggestions.length > 0 ? (
            <FlatList
              data={suggestions.slice(0, 5)}
              keyExtractor={(item) => item.placeId}
              renderItem={renderSuggestion}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 250 }}
            />
          ) : (
             <View className="py-6 items-center justify-center">
                <Text className={`font-outfit ${isLight ? 'text-slate-500' : 'text-white/60'}`}>No locations found</Text>
             </View>
          )}
        </View>
      )}
    </View>
  );
}

export const LocationAutocomplete = React.memo(LocationAutocompleteComponent);
