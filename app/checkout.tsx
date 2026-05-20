import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../src/store/useStore';
import { CartItemType } from '../src/types';

export default function CheckoutScreen() {
  const router = useRouter();
  
  const cartItems = useStore(state => state.cartItems);
  const buyNowItem = useStore(state => state.buyNowItem);
  const activeVoucherDiscount = useStore(state => state.activeVoucherDiscount);
  const useCoins = useStore(state => state.useCoins);
  
  const [shippingSelections, setShippingSelections] = useState<{[seller: string]: number}>({});
  const [paymentMethod, setPaymentMethod] = useState<string>('GCash');
  const [expandedSellers, setExpandedSellers] = useState<{[seller: string]: boolean}>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [selectedAddress, setSelectedAddress] = useState({
    name: 'Juan Dela Cruz',
    phone: '09XX XXX 1234',
    details: '123 Mabini St, Malate, Manila, 1004',
    city: 'Metro Manila',
    tag: 'Home',
  });
  
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [tempAddress, setTempAddress] = useState({...selectedAddress});

  // Group selected items
  const checkedItems = useMemo(() => {
    if (buyNowItem) return [buyNowItem];
    return cartItems.filter(i => i.isChecked);
  }, [cartItems, buyNowItem]);
  
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: CartItemType[] } = {};
    checkedItems.forEach(item => {
      const seller = item.product.seller;
      if (!groups[seller]) groups[seller] = [];
      groups[seller].push(item);
    });
    return groups;
  }, [checkedItems]);

  const subtotal = checkedItems.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);

  // Calculate Shipping
  // Default to 50 if not explicitly set
  const totalShipping = useMemo(() => {
    let cost = 0;
    Object.keys(groupedItems).forEach(seller => {
      cost += shippingSelections[seller] !== undefined ? shippingSelections[seller] : 50;
    });
    return cost;
  }, [groupedItems, shippingSelections]);

  const coinsDiscount = useCoins ? 24 : 0;
  const rawTotal = subtotal + totalShipping - activeVoucherDiscount - coinsDiscount;
  const total = Math.max(0, rawTotal);

  const handleSetShipping = (seller: string, cost: number) => {
    setShippingSelections(prev => ({ ...prev, [seller]: cost }));
  };

  const toggleExpand = (seller: string) => {
    setExpandedSellers(prev => ({ ...prev, [seller]: !prev[seller] }));
  };

  const placeOrder = useStore(state => state.placeOrder);

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    // Simulate network request
    setTimeout(() => {
      setIsProcessing(false);
      placeOrder(checkedItems, total);
      router.replace('/order-success');
    }, 2000);
  };

  const handleOpenAddressModal = () => {
    setTempAddress({...selectedAddress});
    setIsAddressModalVisible(true);
  };

  const handleSaveAddress = () => {
    setSelectedAddress({...tempAddress});
    setIsAddressModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={[styles.sectionTitleRow, { marginTop: 16 }]}>
          <MaterialCommunityIcons name="map-marker-outline" size={20} color="#1A365D" />
          <Text style={styles.sectionTitle}>Delivery Address</Text>
        </View>
        
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressName}>{selectedAddress.name} | {selectedAddress.phone}</Text>
            <View style={styles.homeTag}><Text style={styles.homeTagText}>{selectedAddress.tag}</Text></View>
            <View style={{flex:1}}/>
            <TouchableOpacity onPress={handleOpenAddressModal}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.addressDetails}>{selectedAddress.details}</Text>
          <Text style={styles.addressDetails}>{selectedAddress.city}</Text>
        </View>

        <TouchableOpacity style={styles.addAddressBtn} onPress={handleOpenAddressModal}>
          <MaterialCommunityIcons name="plus" size={18} color="#666666" />
          <Text style={styles.addAddressText}>Add New Address</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Sellers & Items */}
        {Object.keys(groupedItems).map(seller => {
          const items = groupedItems[seller];
          const sellerSubtotal = items.reduce((sum, i) => sum + (i.currentPrice * i.quantity), 0);
          const currentShipping = shippingSelections[seller] !== undefined ? shippingSelections[seller] : 50;
          const isExpanded = expandedSellers[seller];

          return (
            <View key={seller} style={styles.sellerGroup}>
              <View style={styles.sellerHeader}>
                <MaterialCommunityIcons name="storefront-outline" size={20} color="#1A365D" style={{marginRight: 8}} />
                <Text style={styles.sellerName}>{seller}</Text>
              </View>

              {/* Shipping Selection */}
              <TouchableOpacity 
                style={[styles.shippingOption, currentShipping === 50 && styles.shippingOptionActive]}
                onPress={() => handleSetShipping(seller, 50)}
              >
                <MaterialCommunityIcons 
                  name={currentShipping === 50 ? "radiobox-marked" : "radiobox-blank"} 
                  size={20} 
                  color={currentShipping === 50 ? "#1A365D" : "#CCCCCC"} 
                />
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingTitle}>Standard Shipping ₱50</Text>
                  <Text style={styles.shippingDate}>Arrives Jan 15–17</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.shippingOption, currentShipping === 150 && styles.shippingOptionActive]}
                onPress={() => handleSetShipping(seller, 150)}
              >
                <MaterialCommunityIcons 
                  name={currentShipping === 150 ? "radiobox-marked" : "radiobox-blank"} 
                  size={20} 
                  color={currentShipping === 150 ? "#1A365D" : "#CCCCCC"} 
                />
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingTitle}>Express Shipping ₱150</Text>
                  <Text style={styles.shippingDate}>Arrives Jan 14</Text>
                </View>
              </TouchableOpacity>

              {/* Items Summary (Expandable) */}
              <TouchableOpacity style={styles.itemSummary} onPress={() => toggleExpand(seller)}>
                <View style={styles.itemSummaryLeft}>
                  <Image source={{uri: items[0].product.image_url}} style={styles.itemSummaryImage} />
                  <View style={{marginLeft: 12}}>
                    <Text style={styles.itemSummaryTitle}>{items.length} items · ₱{sellerSubtotal.toLocaleString()} total</Text>
                    <Text style={styles.itemSummarySubtitle} numberOfLines={1}>{items[0].product.name}</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color="#666" />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.expandedItemsContainer}>
                  {items.map(item => (
                    <View key={item.id} style={styles.expandedItemRow}>
                      <Image source={{uri: item.product.image_url}} style={styles.expandedItemImage} />
                      <View style={{flex: 1, marginLeft: 12}}>
                        <Text style={styles.expandedItemName} numberOfLines={1}>{item.product.name}</Text>
                        {item.variant && <Text style={styles.expandedItemVariant}>{item.variant}</Text>}
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 4}}>
                          <Text style={styles.expandedItemPrice}>₱{item.currentPrice.toLocaleString()}</Text>
                          <Text style={styles.expandedItemQty}>x{item.quantity}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.divider} />

        {/* Payment Methods */}
        <Text style={styles.sectionTitlePlain}>Payment Method</Text>

        <TouchableOpacity 
          style={[styles.paymentOption, paymentMethod === 'GCash' && styles.paymentOptionActive]}
          onPress={() => setPaymentMethod('GCash')}
        >
          <MaterialCommunityIcons 
            name={paymentMethod === 'GCash' ? "radiobox-marked" : "radiobox-blank"} 
            size={20} 
            color={paymentMethod === 'GCash' ? "#1A365D" : "#CCCCCC"} 
          />
          <View style={styles.gcashBadge}><Text style={styles.gcashText}>GCash</Text></View>
          <Text style={styles.paymentTitle}>Linked: 09XX XXX 1234</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.paymentOption, paymentMethod === 'Card' && styles.paymentOptionActive]}
          onPress={() => setPaymentMethod('Card')}
        >
          <MaterialCommunityIcons 
            name={paymentMethod === 'Card' ? "radiobox-marked" : "radiobox-blank"} 
            size={20} 
            color={paymentMethod === 'Card' ? "#1A365D" : "#CCCCCC"} 
          />
          <MaterialCommunityIcons name="credit-card-outline" size={24} color="#666" style={{marginHorizontal: 8}} />
          <Text style={styles.paymentTitle}>Credit/Debit Card</Text>
          <View style={{flex:1}}/>
          <Text style={styles.addCardText}>Add Card</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentOptionActive]}
          onPress={() => setPaymentMethod('COD')}
        >
          <MaterialCommunityIcons 
            name={paymentMethod === 'COD' ? "radiobox-marked" : "radiobox-blank"} 
            size={20} 
            color={paymentMethod === 'COD' ? "#1A365D" : "#CCCCCC"} 
          />
          <MaterialCommunityIcons name="cash" size={24} color="#666" style={{marginHorizontal: 8}} />
          <Text style={styles.paymentTitle}>Cash on Delivery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.paymentOption, {opacity: 0.5}]} disabled>
          <MaterialCommunityIcons name="radiobox-blank" size={20} color="#CCCCCC" />
          <MaterialCommunityIcons name="clock-time-four-outline" size={24} color="#666" style={{marginHorizontal: 8}} />
          <Text style={styles.paymentTitle}>WatchList PayLater</Text>
          <View style={{flex:1}}/>
          <View style={styles.paylaterTag}><Text style={styles.paylaterTagText}>Apply to unlock</Text></View>
        </TouchableOpacity>

        {/* Summary Details */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₱{subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping Fee</Text>
            <Text style={styles.summaryValue}>₱{totalShipping.toLocaleString()}</Text>
          </View>
          {activeVoucherDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelDiscount}>Voucher Discount</Text>
              <Text style={styles.summaryValueDiscount}>-₱{activeVoucherDiscount.toLocaleString()}</Text>
            </View>
          )}
          {useCoins && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelDiscount}>WatchList Coins</Text>
              <Text style={styles.summaryValueDiscount}>-₱{coinsDiscount.toLocaleString()}</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payment</Text>
            <Text style={styles.totalValue}>₱{total.toLocaleString()}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.placeOrderBtn} 
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.placeOrderText}>Place Order ₱{total.toLocaleString()}</Text>
          )}
        </TouchableOpacity>
        <View style={styles.secureRow}>
          <MaterialCommunityIcons name="lock-outline" size={12} color="#666" />
          <Text style={styles.secureText}>Secured by WatchList Pay</Text>
          <MaterialCommunityIcons name="shield-check-outline" size={12} color="#1A365D" />
        </View>
      </View>

      {/* Address Input Modal */}
      <Modal
        visible={isAddressModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Delivery Address</Text>
              <TouchableOpacity onPress={() => setIsAddressModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.addressForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={tempAddress.name}
                onChangeText={(val) => setTempAddress(prev => ({...prev, name: val}))}
                placeholder="Juan Dela Cruz"
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={tempAddress.phone}
                onChangeText={(val) => setTempAddress(prev => ({...prev, phone: val}))}
                placeholder="09XX XXX XXXX"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Address Details</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                value={tempAddress.details}
                onChangeText={(val) => setTempAddress(prev => ({...prev, details: val}))}
                placeholder="House No., Street Name, Barangay"
                multiline
              />

              <Text style={styles.inputLabel}>City/Region</Text>
              <TextInput
                style={styles.textInput}
                value={tempAddress.city}
                onChangeText={(val) => setTempAddress(prev => ({...prev, city: val}))}
                placeholder="Metro Manila"
              />

              <Text style={styles.inputLabel}>Address Tag (e.g., Home, Office)</Text>
              <View style={styles.tagRow}>
                {['Home', 'Office'].map(tag => (
                  <TouchableOpacity 
                    key={tag}
                    style={[styles.tagBtn, tempAddress.tag === tag && styles.tagBtnActive]}
                    onPress={() => setTempAddress(prev => ({...prev, tag}))}
                  >
                    <Text style={[styles.tagText, tempAddress.tag === tag && styles.tagTextActive]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
                <TextInput
                  style={[styles.textInput, { flex: 1, marginBottom: 0, marginLeft: 8 }]}
                  value={['Home', 'Office'].includes(tempAddress.tag) ? '' : tempAddress.tag}
                  onChangeText={(val) => setTempAddress(prev => ({...prev, tag: val}))}
                  placeholder="Other"
                />
              </View>

              <TouchableOpacity style={styles.saveAddressBtn} onPress={handleSaveAddress}>
                <Text style={styles.saveAddressText}>Save Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  scrollContent: { paddingBottom: 120 },
  
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginLeft: 8 },
  sectionTitlePlain: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginHorizontal: 16, marginBottom: 12 },

  addressCard: {
    marginHorizontal: 16, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 16,
  },
  addressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  addressName: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
  homeTag: { backgroundColor: '#E3F2FD', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  homeTagText: { fontSize: 10, color: '#1A365D', fontWeight: 'bold' },
  changeText: { fontSize: 12, color: '#1A365D', fontWeight: 'bold' },
  addressDetails: { fontSize: 12, color: '#666666', lineHeight: 18 },

  addAddressBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16,
    marginTop: 12, paddingVertical: 12, borderWidth: 1, borderColor: '#EEEEEE', borderRadius: 8, borderStyle: 'dashed',
  },
  addAddressText: { fontSize: 14, color: '#666666', marginLeft: 8 },

  divider: { height: 8, backgroundColor: '#F8F9FA', marginVertical: 24 },

  sellerGroup: { marginHorizontal: 16, marginBottom: 8 },
  sellerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sellerName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },

  shippingOption: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: 8, padding: 12, marginBottom: 8,
  },
  shippingOptionActive: { borderColor: '#1A365D', backgroundColor: '#F5F7FA' },
  shippingInfo: { marginLeft: 12 },
  shippingTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
  shippingDate: { fontSize: 12, color: '#666666', marginTop: 2 },

  itemSummary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F8F9FA', padding: 12, borderRadius: 8, marginTop: 8,
  },
  itemSummaryLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemSummaryImage: { width: 40, height: 40, borderRadius: 4, backgroundColor: '#EEEEEE' },
  itemSummaryTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
  itemSummarySubtitle: { fontSize: 12, color: '#666666', marginTop: 2 },

  expandedItemsContainer: { marginTop: 12, paddingHorizontal: 8 },
  expandedItemRow: { flexDirection: 'row', marginBottom: 12 },
  expandedItemImage: { width: 48, height: 48, borderRadius: 4, backgroundColor: '#F5F5F5' },
  expandedItemName: { fontSize: 14, color: '#1A1A1A' },
  expandedItemVariant: { fontSize: 12, color: '#666666', marginTop: 2 },
  expandedItemPrice: { fontSize: 14, fontWeight: 'bold', color: '#1A365D' },
  expandedItemQty: { fontSize: 12, color: '#666666' },

  paymentOption: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: 8, padding: 16, marginBottom: 8,
  },
  paymentOptionActive: { borderColor: '#1A365D', backgroundColor: '#F5F7FA' },
  gcashBadge: { backgroundColor: '#0052FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 12, marginRight: 8 },
  gcashText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold', fontStyle: 'italic' },
  paymentTitle: { fontSize: 14, color: '#1A1A1A', marginLeft: 8 },
  addCardText: { fontSize: 12, color: '#0052FF', fontWeight: 'bold' },
  paylaterTag: { backgroundColor: '#EEEEEE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  paylaterTagText: { fontSize: 10, color: '#666666' },

  summaryContainer: { marginHorizontal: 16, marginTop: 24 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#666666' },
  summaryValue: { fontSize: 14, color: '#1A1A1A' },
  summaryLabelDiscount: { fontSize: 14, color: '#E53935' },
  summaryValueDiscount: { fontSize: 14, color: '#E53935' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#1A365D' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: '#EEEEEE',
  },
  placeOrderBtn: { backgroundColor: '#0A1A3A', borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  placeOrderText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  secureRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  secureText: { fontSize: 10, color: '#666666', marginHorizontal: 4 },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '40%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },

  // Form Styles
  addressForm: {
    maxHeight: 500,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  tagBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  tagBtnActive: {
    borderColor: '#1A365D',
    backgroundColor: '#1A365D',
  },
  tagText: {
    fontSize: 13,
    color: '#666666',
  },
  tagTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  saveAddressBtn: {
    backgroundColor: '#1A365D',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveAddressText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});