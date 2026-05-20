import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store/useStore';

export default function MyOrdersScreen() {
  const router = useRouter();
  const pastOrders = useStore(state => state.pastOrders);
  const [activeTab, setActiveTab] = useState('All');
  
  const tabs = ['All', 'To Pay', 'To Ship', 'To Receive', 'Completed'];

  const filteredOrders = activeTab === 'All' 
    ? pastOrders 
    : pastOrders.filter(order => order.status === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WishList</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#1A365D" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <Text style={styles.pageTitle}>My Orders</Text>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {tabs.map((tab) => (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Order Items */}
        <View style={styles.ordersList}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="package-variant" size={64} color="#E0E0E0" />
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderIdContainer}>
                    <MaterialCommunityIcons 
                      name={order.status === 'Completed' ? "truck-outline" : "package-variant-closed"} 
                      size={16} 
                      color="#666666" 
                      style={{ marginRight: 4 }} 
                    />
                    <Text style={styles.orderId}>Order #{order.id}</Text>
                  </View>
                  <View style={[
                    styles.statusPill,
                    order.status === 'Completed' ? styles.statusPillCompleted : styles.statusPillToReceive
                  ]}>
                    <Text style={[
                      styles.statusText,
                      order.status === 'Completed' ? styles.statusTextCompleted : styles.statusTextToReceive
                    ]}>{order.status}</Text>
                  </View>
                </View>

                {order.items.map((item, idx) => (
                  <View key={`${order.id}-${idx}`} style={styles.productRow}>
                    <Image source={{ uri: item.product.image_url }} style={styles.productImage} />
                    <View style={styles.productDetails}>
                      <Text style={styles.productName} numberOfLines={1}>{item.product.name}</Text>
                      {item.variant && <Text style={styles.productVariant}>{item.variant}</Text>}
                      <View style={styles.priceRow}>
                        <Text style={styles.productPrice}>₱{item.currentPrice.toLocaleString()}</Text>
                        <Text style={styles.productQty}>Qty: {item.quantity}</Text>
                      </View>
                    </View>
                  </View>
                ))}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Payment:</Text>
                  <Text style={styles.totalPrice}>₱{order.total.toLocaleString()}</Text>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.secondaryBtn}>
                    <Text style={styles.secondaryBtnText}>Track</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryBtn}>
                    <Text style={styles.primaryBtnText}>Order Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
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
  tabsContainer: { borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#FFFFFF' },
  tabsScroll: { paddingHorizontal: 16 },
  tab: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#2962FF' },
  tabText: { fontSize: 14, color: '#666666', fontWeight: '500' },
  activeTabText: { color: '#2962FF', fontWeight: 'bold' },
  ordersList: { padding: 16 },
  orderCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', padding: 16, marginBottom: 16 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  orderIdContainer: { flexDirection: 'row', alignItems: 'center' },
  orderId: { fontSize: 12, color: '#666666' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusPillCompleted: { backgroundColor: '#E8F5E9' },
  statusPillToReceive: { backgroundColor: '#E3F2FD' },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  statusTextCompleted: { color: '#2E7D32' },
  statusTextToReceive: { color: '#1976D2' },
  productRow: { flexDirection: 'row', marginBottom: 16 },
  productImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#F5F5F5' },
  productDetails: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  productName: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  productVariant: { fontSize: 12, color: '#666666', marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#1A365D' },
  productQty: { fontSize: 12, color: '#666666' },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  totalLabel: { fontSize: 13, color: '#666666', marginRight: 8 },
  totalPrice: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  secondaryBtn: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20, marginRight: 12 },
  secondaryBtnText: { color: '#1A1A1A', fontSize: 13, fontWeight: '600' },
  primaryBtn: { backgroundColor: '#0047CC', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 16, color: '#999999', marginTop: 16 },
});
