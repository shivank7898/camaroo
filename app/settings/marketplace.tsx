import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical, Plus } from 'lucide-react-native';
import TopGradientFade from '@components/ui/TopGradientFade';
import MarketplaceItemCard from '@/components/feed/MarketplaceItemCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Data for active and history
const ACTIVE_LISTINGS = [
  { id: 'm1', title: 'Canon EOS R5', price: '₹3000/ day', location: 'Mumbai', thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80' },
  { id: 'm2', title: 'DJI Mavic Pro', price: '₹4500/ day', location: 'Bangalore', thumbnail: 'https://images.unsplash.com/photo-1473968512647-380d0d829929?auto=format&fit=crop&w=500&q=80' },
];

const HISTORY_LISTINGS = [
  { id: 'm3', title: 'Sony FE 24-70mm', price: '₹1500/ day', location: 'Delhi', thumbnail: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=500&q=80' },
];

export default function MyMarketplaceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [modalItemIdx, setModalItemIdx] = useState<string | null>(null);

  // In reality, this length check handles conditionally showing the empty state.
  // We'll simulate empty active lists condition manually if the user deleted items inside the app
  const displayedListings = activeTab === 'active' ? ACTIVE_LISTINGS : HISTORY_LISTINGS;
  const isPopulated = displayedListings.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <TopGradientFade />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 4, marginLeft: -12 }}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#000' }}>My Marketplace</Text>
          </View>

          {/* Plus icon shown on Top Right Only IF Populated */}
          {activeTab === 'active' && isPopulated && (
             <TouchableOpacity 
               onPress={() => router.push('/marketplace/create')} 
               style={{ width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
             >
                <Plus size={20} color="#0EA5E9" />
             </TouchableOpacity>
          )}
        </View>

        {/* Clean Segments (Mirrors ProfileTabBar style) */}
        <View className="flex-row items-center border-b border-slate-100" style={{ width: SCREEN_WIDTH }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('active')}
            style={{ flex: 1, paddingVertical: 14, alignItems: "center" }}
          >
            <Text className={`font-outfit-medium ${activeTab === 'active' ? "text-slate-900" : "text-slate-400"}`}>
               Active Listings
            </Text>
            {activeTab === 'active' && (
               <View className="absolute bottom-[0px] w-[50%] h-0.5 bg-slate-900 rounded-t-full" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('history')}
            style={{ flex: 1, paddingVertical: 14, alignItems: "center" }}
          >
            <Text className={`font-outfit-medium ${activeTab === 'history' ? "text-slate-900" : "text-slate-400"}`}>
               Transaction History
            </Text>
            {activeTab === 'history' && (
               <View className="absolute bottom-[0px] w-[60%] h-0.5 bg-slate-900 rounded-t-full" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: (insets.bottom || 0) + 100 }}>
          
          {/* Active Empty State (Matches Opportunities Empty Node) */}
          {activeTab === 'active' && !isPopulated && (
             <TouchableOpacity
               activeOpacity={0.8}
               onPress={() => router.push('/marketplace/create')}
               className="bg-slate-50 rounded-3xl p-5 border border-slate-200 shadow-sm items-center justify-center mt-4"
               style={{ minHeight: 180 }}
             >
               <View className="w-14 h-14 rounded-full bg-white shadow-sm items-center justify-center mb-4">
                 <Plus size={24} color="#0EA5E9" />
               </View>
               <Text className="font-outfit-medium text-lg text-slate-700">List New Gear</Text>
               <Text className="font-outfit text-sm text-slate-500 mt-1 text-center px-4">Start earning by listing your photography setups securely to the marketplace.</Text>
             </TouchableOpacity>
          )}

          {/* Listings Wrapper */}
          <View className="flex-row flex-wrap justify-between">
            {displayedListings.map((item) => (
              <MarketplaceItemCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                location={item.location}
                thumbnail={item.thumbnail}
                style={{ width: "48%", marginBottom: 20 }}
                onOptionsPress={activeTab === 'active' ? (id) => setModalItemIdx(id) : undefined}
                onPress={(id) => router.push({ pathname: '/marketplace/[id]' as any, params: { id } })}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Basic ActionSheet Emulation */}
      <Modal visible={modalItemIdx !== null} transparent animationType="fade">
        <TouchableOpacity activeOpacity={1} className="flex-1 bg-black/40 justify-end" onPress={() => setModalItemIdx(null)}>
          <View className="bg-white rounded-t-3xl pt-2 pb-8 px-5 absolute bottom-0 left-0 right-0 w-full">
            
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-5 mt-1" />

            <TouchableOpacity className="py-4 border-b border-slate-100 flex-row items-center" onPress={() => setModalItemIdx(null)}>
               <Text className="font-outfit-medium text-lg text-slate-800 ml-2">Edit Listing</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="py-4 border-b border-slate-100 flex-row items-center" onPress={() => setModalItemIdx(null)}>
               <Text className="font-outfit-medium text-lg text-sky-600 ml-2">Mark as Rented</Text>
            </TouchableOpacity>

            <TouchableOpacity className="py-4 border-b border-slate-100 flex-row items-center" onPress={() => setModalItemIdx(null)}>
               <Text className="font-outfit-medium text-lg text-sky-600 ml-2">Mark as Sold</Text>
            </TouchableOpacity>

            <TouchableOpacity className="py-4 flex-row items-center mt-2" onPress={() => setModalItemIdx(null)}>
               <Text className="font-outfit-bold text-lg text-red-500 ml-2">Delete Local Listing</Text>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
