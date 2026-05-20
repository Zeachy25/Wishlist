import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
  const router = useRouter();

  const [priceDrops, setPriceDrops] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState<'Push' | 'SMS'>('Push');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WatchList</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#2962FF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Notification Settings</Text>
          <Text style={styles.pageSubtitle}>Manage how and when you receive alerts from WatchList.</Text>
        </View>

        {/* Alert Center Card */}
        <View style={styles.alertCenterCard}>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Alert Center</Text>
            <Text style={styles.alertDesc}>Customize your shopping experience with real-time price monitoring.</Text>
          </View>
          <MaterialCommunityIcons name="bell-ring-outline" size={80} color="#E0E0E0" style={styles.alertIconWatermark} />
        </View>

        {/* Settings List */}
        <View style={styles.settingsList}>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <MaterialCommunityIcons name="trending-down" size={20} color="#2962FF" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Price Drops</Text>
              <Text style={styles.settingDesc}>Get notified instantly when items in your Wishlist or Cart decrease in price.</Text>
            </View>
            <Switch
              trackColor={{ false: '#E0E0E0', true: '#2962FF' }}
              thumbColor={'#FFFFFF'}
              onValueChange={setPriceDrops}
              value={priceDrops}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <MaterialCommunityIcons name="truck-outline" size={20} color="#2962FF" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Order Updates</Text>
              <Text style={styles.settingDesc}>Receive tracking numbers, delivery status changes, and order confirmations.</Text>
            </View>
            <Switch
              trackColor={{ false: '#E0E0E0', true: '#2962FF' }}
              thumbColor={'#FFFFFF'}
              onValueChange={setOrderUpdates}
              value={orderUpdates}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <MaterialCommunityIcons name="tag-outline" size={20} color="#2962FF" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Promotions</Text>
              <Text style={styles.settingDesc}>Exclusive deals, seasonal sales, and personalized discount codes.</Text>
            </View>
            <Switch
              trackColor={{ false: '#E0E0E0', true: '#2962FF' }}
              thumbColor={'#FFFFFF'}
              onValueChange={setPromotions}
              value={promotions}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#2962FF" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Newsletter</Text>
              <Text style={styles.settingDesc}>Weekly roundup of top-rated products and technology trends.</Text>
            </View>
            <Switch
              trackColor={{ false: '#E0E0E0', true: '#2962FF' }}
              thumbColor={'#FFFFFF'}
              onValueChange={setNewsletter}
              value={newsletter}
            />
          </View>

        </View>

        {/* Delivery Methods */}
        <View style={styles.deliverySection}>
          <Text style={styles.sectionTitle}>Delivery Methods</Text>
          <View style={styles.deliveryGrid}>
            <TouchableOpacity 
              style={[styles.deliveryCard, deliveryMethod === 'Push' && styles.deliveryCardActive]}
              onPress={() => setDeliveryMethod('Push')}
            >
              <MaterialCommunityIcons 
                name="cellphone" 
                size={24} 
                color={deliveryMethod === 'Push' ? '#1A1A1A' : '#666666'} 
                style={{ marginBottom: 8 }} 
              />
              <Text style={[styles.deliveryTitle, deliveryMethod === 'Push' && styles.deliveryTitleActive]}>Push</Text>
              <Text style={[styles.deliveryStatus, deliveryMethod === 'Push' && styles.deliveryStatusActive]}>
                {deliveryMethod === 'Push' ? 'Enabled' : 'Disabled'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.deliveryCard, deliveryMethod === 'SMS' && styles.deliveryCardActive]}
              onPress={() => setDeliveryMethod('SMS')}
            >
              <MaterialCommunityIcons 
                name="message-processing-outline" 
                size={24} 
                color={deliveryMethod === 'SMS' ? '#1A1A1A' : '#666666'} 
                style={{ marginBottom: 8 }} 
              />
              <Text style={[styles.deliveryTitle, deliveryMethod === 'SMS' && styles.deliveryTitleActive]}>SMS</Text>
              <Text style={[styles.deliveryStatus, deliveryMethod === 'SMS' && styles.deliveryStatusActive]}>
                {deliveryMethod === 'SMS' ? 'Enabled' : 'Disabled'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promo Banner */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80' }} 
            style={styles.promoBanner}
            imageStyle={{ borderRadius: 12, opacity: 0.5 }}
          >
            <View style={styles.promoBannerOverlay}>
              <Text style={styles.promoBannerText}>Stay Informed 24/7</Text>
            </View>
          </ImageBackground>
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save All Changes</Text>
          </TouchableOpacity>
          <Text style={styles.lastUpdatedText}>Last updated: Today, 10:45 AM</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F8F9FA', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  iconBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  titleSection: { padding: 16, paddingBottom: 8 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  pageSubtitle: { fontSize: 14, color: '#666666', lineHeight: 20 },
  alertCenterCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#CCCCCC', padding: 16, margin: 16, position: 'relative', overflow: 'hidden' },
  alertContent: { flex: 1, zIndex: 2 },
  alertTitle: { fontSize: 16, fontWeight: 'bold', color: '#0A1A3A', marginBottom: 8 },
  alertDesc: { fontSize: 13, color: '#666666', lineHeight: 18, paddingRight: 40 },
  alertIconWatermark: { position: 'absolute', right: -10, top: -10, opacity: 0.5, zIndex: 1 },
  settingsList: { paddingHorizontal: 16 },
  settingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', padding: 16, marginBottom: 12 },
  settingIconContainer: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#EDF2FA', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  settingTextContainer: { flex: 1, marginRight: 16 },
  settingTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  settingDesc: { fontSize: 12, color: '#666666', lineHeight: 16 },
  deliverySection: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
  deliveryGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  deliveryCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', padding: 16, alignItems: 'center', marginHorizontal: 4 },
  deliveryCardActive: { borderColor: '#E0E0E0', backgroundColor: '#FFFFFF' }, // Kept simple
  deliveryTitle: { fontSize: 14, fontWeight: '500', color: '#1A1A1A', marginBottom: 4 },
  deliveryTitleActive: { color: '#1A1A1A' },
  deliveryStatus: { fontSize: 12, color: '#999999' },
  deliveryStatusActive: { color: '#2962FF', fontWeight: 'bold' },
  promoBanner: { height: 100, backgroundColor: '#1A365D', borderRadius: 12, overflow: 'hidden' },
  promoBannerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  promoBannerText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  actionSection: { padding: 16, marginTop: 16, alignItems: 'center' },
  saveBtn: { backgroundColor: '#2962FF', borderRadius: 24, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 12 },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  lastUpdatedText: { fontSize: 12, color: '#666666' },
});
