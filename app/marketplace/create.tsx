import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Camera, ArrowLeft } from 'lucide-react-native';
import { Input } from '@/components/Input';
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete';
import Button from '@/components/Button';

export default function MarketplaceCreateScreen() {
  const router = useRouter();
  const [type, setType] = useState<'SELL' | 'RENT'>('RENT');
  const [location, setLocation] = useState<any>(null);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header exactly matching CreateOpportunity */}
      <View className="px-5 py-4 flex-row items-center justify-between border-b border-slate-100 bg-white z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full bg-slate-50">
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text className="font-outfit-bold text-lg text-slate-900 flex-1 ml-4">Post Gear</Text>
      </View>

      <KeyboardAwareScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 60}
      >
        <Text className="font-outfit text-sm text-slate-500 mb-6">
          Fill out the details to post your gear for rent or sale.
        </Text>

        {/* Image Pickers */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity className="w-[31%] aspect-square bg-slate-50 rounded-2xl items-center justify-center border border-dashed border-slate-300">
            <Camera size={24} color="#94A3B8" />
            <Text className="font-outfit text-[10px] text-slate-400 mt-2">Main</Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-[31%] aspect-square bg-slate-50 rounded-2xl items-center justify-center border border-dashed border-slate-300">
            <Camera size={24} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity className="w-[31%] aspect-square bg-slate-50 rounded-2xl items-center justify-center border border-dashed border-slate-300">
            <Camera size={24} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="mb-4">
           <Text className="text-xs font-outfit-medium text-slate-500 mb-2 ml-1">Listing Type *</Text>
           <View className="flex-row gap-2">
              <TouchableOpacity onPress={() => setType('SELL')} className={`flex-1 py-3 rounded-xl items-center border ${type === 'SELL' ? 'bg-sky-50 border-sky-500' : 'bg-slate-50 border-slate-200'}`}>
                 <Text className={`font-outfit-bold ${type === 'SELL' ? 'text-sky-600' : 'text-slate-500'}`}>Sell</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setType('RENT')} className={`flex-1 py-3 rounded-xl items-center border ${type === 'RENT' ? 'bg-sky-50 border-sky-500' : 'bg-slate-50 border-slate-200'}`}>
                 <Text className={`font-outfit-bold ${type === 'RENT' ? 'text-sky-600' : 'text-slate-500'}`}>Rent</Text>
              </TouchableOpacity>
           </View>
        </View>

        <Input label="Title *" placeholder="e.g. Sony A7 IV Mirrorless" variant="light" className="mb-4" />
        <Input label="Category *" placeholder="e.g. CAMERA_BODY" variant="light" className="mb-4" />
        <Input label="Condition *" placeholder="e.g. LIKE_NEW" variant="light" className="mb-4" />
        
        <Input label={type === 'SELL' ? 'Price *' : 'Total Asset Value (Price) *'} placeholder="e.g. 120000" keyboardType="numeric" variant="light" className="mb-4" />
        
        {type === 'RENT' && (
           <Input label="Rental Price (per day) *" placeholder="e.g. 3000" keyboardType="numeric" variant="light" className="mb-4" />
        )}

        <View className="mb-5 z-50">
           <Text className="text-xs font-outfit-medium text-slate-500 mb-2 ml-1">Location *</Text>
           <LocationAutocomplete value={location} onSelect={(loc) => setLocation(loc)} />
        </View>
        
        <View className="-z-10">
          <Input 
            label="Description" 
            placeholder="Detail your gear conditions, rules..." 
            multiline 
            numberOfLines={5}
            variant="light" 
            style={{ minHeight: 120, paddingTop: 16, textAlignVertical: 'top' }}
            className="mb-4" 
          />
        </View>

      </KeyboardAwareScrollView>

      {/* Footer stays inside KAV bounds identical to CreateOpportunity */}
      <View className="p-5 bg-white border-t border-slate-100">
        <Button
          title="Publish Listing"
          onPress={() => console.log("Submit")}
        />
      </View>
    </SafeAreaView>
  );
}
