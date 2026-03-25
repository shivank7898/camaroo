import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';

interface SearchableDropdownProps {
  label?: string;
  items: ItemType<string>[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: string;
  loading?: boolean;
}

export function SearchableDropdown({
  label,
  items,
  value,
  onValueChange,
  placeholder = "Select an item",
  searchPlaceholder = "Search...",
  disabled = false,
  error,
  loading = false,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false);
  const [localItems, setLocalItems] = useState<ItemType<string>[]>([]);

  React.useEffect(() => {
    setLocalItems(items);
  }, [items]);

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text className="text-xs font-outfit-medium text-text-secondary mb-2 ml-1 tracking-wider uppercase">
          {label}
        </Text>
      )}
      <View style={{ position: 'relative' }}>
        <DropDownPicker
          open={open}
          value={value}
          items={localItems}
          setOpen={setOpen}
          setValue={(callback) => {
            const newVal = typeof callback === 'function' ? callback(value) : callback;
            onValueChange(newVal);
          }}
          setItems={setLocalItems}
          searchable={!loading}
          disabled={disabled || loading}
          placeholder={loading ? 'Loading...' : placeholder}
          searchPlaceholder={searchPlaceholder}
          theme="DARK"
          listMode="MODAL"
          modalProps={{
            animationType: 'fade'
          }}
          modalContentContainerStyle={{
            backgroundColor: '#060D1A',
          }}
          maxHeight={220}
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderColor: error ? '#EF4444' : 'rgba(255,255,255,0.15)',
            borderRadius: 12,
            paddingHorizontal: 16,
            minHeight: 50,
          }}
          dropDownContainerStyle={{
            backgroundColor: '#0F1B2E',
            borderColor: 'rgba(255,255,255,0.15)',
            borderRadius: 12,
          }}
          textStyle={{
            fontFamily: 'outfit',
            color: loading ? 'rgba(148,163,184,0.6)' : '#FFF',
            fontSize: 16,
          }}
          placeholderStyle={{
            color: 'rgba(148,163,184,0.6)',
          }}
          searchTextInputStyle={{
            color: '#FFF',
            borderColor: 'rgba(255,255,255,0.15)',
            fontFamily: 'outfit',
          }}
          searchContainerStyle={{
            borderBottomColor: 'rgba(255,255,255,0.15)',
            backgroundColor: '#0F1B2E',
          }}
          arrowIconStyle={{ tintColor: loading ? 'transparent' : 'rgba(255,255,255,0.6)' } as any}
          tickIconStyle={{ tintColor: '#2575FC' } as any}
        />
        {loading && (
          <View style={{
            position: 'absolute',
            right: 16,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <ActivityIndicator size="small" color="#2575FC" />
          </View>
        )}
      </View>
      {error && (
        <Text className="text-red-500 text-xs font-outfit mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
