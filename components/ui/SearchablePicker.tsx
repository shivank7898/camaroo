import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Search, X, ChevronDown, Check } from 'lucide-react-native';

export interface PickerItem {
  label: string;
  value: string;
}

interface SearchablePickerProps {
  label?: string;
  items: PickerItem[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  disabled?: boolean;
  variant?: "dark" | "light";
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function SearchablePicker({
  label,
  items,
  value,
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  error,
  disabled,
  variant = "dark"
}: SearchablePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const isLight = variant === "light";
  const [searchQuery, setSearchQuery] = useState('');

  const selectedItem = useMemo(() => 
    items.find(item => item.value === value),
    [items, value]
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleSelect = (itemValue: string) => {
    onValueChange(itemValue);
    setModalVisible(false);
    setSearchQuery('');
  };

  const renderItem = ({ item }: { item: PickerItem }) => {
    const isSelected = item.value === value;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleSelect(item.value)}
        className={`flex-row items-center justify-between px-6 py-4 border-b ${isLight ? 'border-slate-100' : 'border-white/5'} ${isSelected ? (isLight ? 'bg-slate-50' : 'bg-white/10') : ''}`}
      >
        <Text className={`font-outfit text-base ${isSelected ? (isLight ? 'text-[#0EA5E9]' : 'text-gold') : (isLight ? 'text-slate-700' : 'text-white')}`}>
          {item.label}
        </Text>
        {isSelected && <Check size={20} color={isLight ? "#0EA5E9" : "#FFD700"} />}
      </TouchableOpacity>
    );
  };

  return (
    <View className="w-full mb-4">
      {label && (
        <Text className={`text-xs font-outfit-medium mb-2 ml-1 tracking-wider uppercase ${isLight ? 'text-slate-500' : 'text-text-secondary'}`}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => !disabled && setModalVisible(true)}
        className={`flex-row items-center border rounded-xl px-4 py-4 ${isLight ? 'bg-slate-50' : 'bg-white/10'} ${
          error ? 'border-red-500' : (isLight ? 'border-slate-200' : 'border-white/15')
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <Text 
          className={`flex-1 font-outfit text-base ${
            selectedItem ? (isLight ? 'text-black' : 'text-white') : (isLight ? 'text-slate-400' : 'text-text-secondary')
          }`}
          numberOfLines={1}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <ChevronDown size={20} color={isLight ? "#94A3B8" : "rgba(255,255,255,0.6)"} />
      </TouchableOpacity>

      {error && (
        <Text className="text-red-500 text-xs font-outfit mt-1 ml-1">{error}</Text>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.85)' }]} />
          
          <SafeAreaView style={styles.modalContainer}>
            <View className={`flex-1 ${isLight ? 'bg-white' : 'bg-[#060D1A]/90'} rounded-t-3xl border-t ${isLight ? 'border-slate-200' : 'border-white/10'} mt-10`}>
              {/* Header */}
              <View className={`px-6 py-4 flex-row items-center justify-between border-b ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
                <Text className={`text-xl font-outfit-bold ${isLight ? 'text-black' : 'text-white'}`}>
                  {label || 'Select Option'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color={isLight ? "#000" : "#FFF"} />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View className="px-6 py-4">
                <View className={`flex-row items-center rounded-xl px-4 py-3 border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/10 border-white/10'}`}>
                  <Search size={18} color={isLight ? "#94A3B8" : "rgba(255,255,255,0.6)"} />
                  <TextInput
                    className={`flex-1 ml-3 font-outfit text-base ${isLight ? 'text-black' : 'text-white'}`}
                    placeholder={searchPlaceholder}
                    placeholderTextColor={isLight ? "#94A3B8" : "rgba(148,163,184,0.6)"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCorrect={false}
                  />
                  {searchQuery !== '' && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <X size={18} color={isLight ? "#94A3B8" : "rgba(255,255,255,0.6)"} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* List */}
              <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.value}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 40 }}
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={5}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View className="items-center py-20">
                    <Text className={`font-outfit ${isLight ? 'text-slate-500' : 'text-text-secondary'}`}>No results found</Text>
                  </View>
                }
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
  },
});
