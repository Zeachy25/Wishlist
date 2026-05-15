import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store/useStore';

// Mock store details based on the seller names in mockData.ts
const MOCK_STORES: Record<string, any> = {
  'Sony Official Store': {
    logo: 'https://via.placeholder.com/60/000000/FFFFFF?text=Sony',
    followers: '25.4k',
    badge: 'New Drop'
  },
  'NIKE OFFICIAL STORE': {
    logo: 'https://via.placeholder.com/60/FF0000/FFFFFF?text=Nike',
    followers: '1.2M',
    badge: null
  },
  'Fujifilm': {
    logo: 'https://via.placeholder.com/60/F0E68C/000000?text=Fujifilm',
    followers: '12.5k',
    badge: 'Flash Sale'
  },
  'Hydro Flask': {
    logo: 'https://via.placeholder.com/60/ADD8E6/000000?text=Hydro',
    followers: '8.2k',
    badge: null
  },
  'Audio Tech Store': {
    logo: 'https://via.placeholder.com/60/333333/FFFFFF?text=Audio',
    followers: '45.1k',
    badge: 'New Drop'
  },
  'Velocity Sports': {
    logo: 'https://via.placeholder.com/60/C62828/FFFFFF?text=VS',
    followers: '12.5k',
    badge: 'New Drop'
  },
  'Chronos Timepieces': {
    logo: 'https://via.placeholder.com/60/1A1A1A/FFFFFF?text=CT',
    followers: '8.2k',
    badge: null
  },
  'Urban Tread': {
    logo: 'https://via.placeholder.com/60/388E3C/FFFFFF?text=UT',
    followers: '45.1k',
    badge: null
  },
  'Sonic Studio': {
    logo: 'https://via.placeholder.com/60/1A365D/FFFFFF?text=SS',
    followers: '2.3k',
    badge: null
  }
};

export default function FollowedStoresScreen() {
  const router = useRouter();
  const followedStores = useStore(state => state.followedStores);
  const toggleFollowStore = useStore(state => state.toggleFollowStore);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Stores');

  const tabs = ['All Stores', 'Recent Drops', 'Flash Sales'];

  // Combine followed stores with mock data
  const storesToDisplay = followedStores
    .filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(name => ({
      name,
      ...(MOCK_STORES[name] || {
        logo: 'https://via.placeholder.com/60/CCCCCC/FFFFFF?text=' + name.charAt(0),
        followers: '1.0k',
        badge: null
      })
    }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WatchList</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#1A365D" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <Text style={styles.pageTitle}>Followed Stores</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color="#999999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your favorite stores..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stores List */}
        <View style={styles.storesList}>
          {storesToDisplay.length > 0 ? (
            storesToDisplay.map((store, index) => (
              <View key={index} style={styles.storeCard}>
                <View style={styles.storeInfoRow}>
                  <Image source={{ uri: store.logo }} style={styles.storeLogo} />
                  <View style={styles.storeTextContent}>
                    <Text style={styles.storeName}>{store.name}</Text>
                    <View style={styles.followerRow}>
                      <MaterialCommunityIcons name="account-group-outline" size={14} color="#666666" style={{ marginRight: 4 }} />
                      <Text style={styles.followerCount}>{store.followers} Followers</Text>
                    </View>
                  </View>
                  {store.badge && (
                    <View style={styles.badgePill}>
                      <Text style={styles.badgeText}>{store.badge}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.visitBtn}>
                    <Text style={styles.visitBtnText}>Visit Store</Text>
                    <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.heartBtn}
                    onPress={() => toggleFollowStore(store.name)}
                  >
                    <MaterialCommunityIcons name="heart" size={24} color="#2962FF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="storefront-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>You are not following any stores yet.</Text>
              <TouchableOpacity 
                style={styles.browseBtn}
                onPress={() => router.push('/(tabs)/browse')}
              >
                <Text style={styles.browseBtnText}>Browse Stores</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF' },
  iconBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A365D', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  searchContainer: { paddingHorizontal: 16, marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: '#EEEEEE' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1A1A1A' },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginRight: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEEEEE' },
  activeTab: { backgroundColor: '#1A365D', borderColor: '#1A365D' },
  tabText: { fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
  activeTabText: { color: '#FFFFFF' },
  storesList: { paddingHorizontal: 16 },
  storeCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EEEEEE' },
  storeInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  storeLogo: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F5F5F5' },
  storeTextContent: { flex: 1, marginLeft: 12 },
  storeName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 2 },
  followerRow: { flexDirection: 'row', alignItems: 'center' },
  followerCount: { fontSize: 12, color: '#666666' },
  badgePill: { backgroundColor: '#D32F2F', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  visitBtn: { flex: 1, backgroundColor: '#0047CC', borderRadius: 8, height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  visitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  heartBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEEEEE', justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: { fontSize: 16, color: '#666666', marginTop: 16, textAlign: 'center', paddingHorizontal: 40 },
  browseBtn: { marginTop: 24, backgroundColor: '#1A365D', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24 },
  browseBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
});
