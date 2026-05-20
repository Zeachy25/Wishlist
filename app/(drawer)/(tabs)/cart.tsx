import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Switch, TextInput, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStore } from '../../../src/store/useStore';
import CartItem from '../../../src/components/CartItem';
import { CartItemType } from '../../../src/types';

export default function CartScreen() {
  const router = useRouter();
  
  const user = useStore(state => state.user);
  const cartItems = useStore(state => state.cartItems);
  const loadUserData = useStore(state => state.loadUserData);
  const toggleCartItem = useStore(state => state.toggleCartItem);
  const toggleSellerItems = useStore(state => state.toggleSellerItems);
  const updateCartQuantity = useStore(state => state.updateCartQuantity);
  const removeFromCart = useStore(state => state.removeFromCart);
  
  const activeVoucherDiscount = useStore(state => state.activeVoucherDiscount);
  const setVoucherDiscount = useStore(state => state.setVoucherDiscount);
  const useCoins = useStore(state => state.useCoins);
  const setUseCoins = useStore(state => state.setUseCoins);

  const [voucherCode, setVoucherCode] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    if (user) {
      setRefreshing(true);
      setError(null);
      try {
        await loadUserData(user.id);
      } catch (err: any) {
        setError(err.message || "Failed to load cart");
      } finally {
        setRefreshing(false);
      }
    }
  }, [user, loadUserData]);

  // Group items by seller
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: CartItemType[] } = {};
    cartItems.forEach(item => {
      const seller = item.product.seller;
      if (!groups[seller]) groups[seller] = [];
      groups[seller].push(item);
    });
    return groups;
  }, [cartItems]);

  // Calculations
  const checkedItems = cartItems.filter(item => item.isChecked);
  const selectedCount = checkedItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const subtotal = checkedItems.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
  
  // Shipping: P50 per unique seller for selected items
  const uniqueSellersChecked = new Set(checkedItems.map(item => item.product.seller)).size;
  const shippingCost = uniqueSellersChecked * 50;

  const coinsDiscount = useCoins ? 24 : 0;
  
  const rawTotal = subtotal + shippingCost - activeVoucherDiscount - coinsDiscount;
  const total = Math.max(0, rawTotal);

  const sections = useMemo(() => {
    return Object.keys(groupedItems).map(seller => ({
      title: seller,
      data: groupedItems[seller],
      key: seller,
    }));
  }, [groupedItems]);

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      setVoucherDiscount(0);
      return;
    }
    
    if (voucherCode.toUpperCase() === 'SAVE500') {
      setVoucherDiscount(500);
      Alert.alert('Voucher Applied', 'You got ₱500 off!');
    } else {
      setVoucherDiscount(0);
      Alert.alert('Invalid Voucher', 'The promo code you entered is invalid or expired.');
    }
  };

  const handleCheckout = () => {
    if (selectedCount === 0) return;
    router.push('/checkout');
  };

  if (error) {
    return (
      <SafeAreaView edges={['top']} style={styles.emptyContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={80} color="#E0E0E0" />
        <Text style={styles.emptyTitle}>Something went wrong</Text>
        <Text style={styles.emptySubtext}>{error}</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={onRefresh}>
          <Text style={styles.shopBtnText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={styles.emptyContainer}>
        <MaterialCommunityIcons name="cart-outline" size={80} color="#E0E0E0" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtext}>Looks like you haven&apos;t added anything yet.</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(drawer)/(tabs)/browse')}>
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart ({cartItems.length} items)</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="magnify" size={24} color="#1A365D" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="dots-horizontal" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderSectionHeader={({ section }) => {
          const items = section.data;
          const allSellerItemsChecked = items.length > 0 && items.every(i => i.isChecked);

          return (
            <View style={styles.sectionCard}>
              <View style={styles.sellerHeader}>
                <TouchableOpacity 
                  style={styles.checkboxContainer} 
                  onPress={() => toggleSellerItems(section.title, !allSellerItemsChecked)}
                >
                  <MaterialCommunityIcons
                    name={allSellerItemsChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={24}
                    color={allSellerItemsChecked ? '#1A365D' : '#999999'}
                  />
                </TouchableOpacity>
                <Text style={styles.sellerName}>{section.title}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
                <View style={{ flex: 1 }} />
                <View style={styles.freeShippingPill}>
                  <MaterialCommunityIcons name="truck-outline" size={12} color="#1A1A1A" style={{marginRight: 4}} />
                  <Text style={styles.freeShippingText}>FREE SHIPPING</Text>
                </View>
              </View>
            </View>
          );
        }}
        renderItem={({ item, index, section }) => {
          const isLast = index === section.data.length - 1;
          return (
            <View style={[styles.itemCard, isLast && styles.itemCardLast]}>
              <CartItem 
                item={item} 
                onToggle={toggleCartItem}
                onUpdateQuantity={updateCartQuantity}
                onRemove={removeFromCart}
              />
            </View>
          );
        }}
        ListFooterComponent={
          <View>
            {/* Voucher Section */}
            <View style={styles.box}>
              <View style={styles.boxHeaderRow}>
                <MaterialCommunityIcons name="ticket-percent-outline" size={20} color="#1A365D" />
                <Text style={styles.boxTitle}>Apply Voucher / Promo Code</Text>
              </View>
              <View style={styles.voucherInputRow}>
                <TextInput
                  style={styles.voucherInput}
                  placeholder="Enter code"
                  value={voucherCode}
                  onChangeText={setVoucherCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.applyBtn} onPress={handleApplyVoucher}>
                  <Text style={styles.applyBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Coins Section */}
            <View style={[styles.box, styles.coinsRow]}>
              <MaterialCommunityIcons name="alpha-c-circle" size={28} color="#FFB300" />
              <View style={styles.coinsInfo}>
                <Text style={styles.coinsTitle}>Use WatchList Coins</Text>
                <Text style={styles.coinsSubtext}>240 coins = ₱24 off</Text>
              </View>
              <Switch
                value={useCoins}
                onValueChange={setUseCoins}
                trackColor={{ false: '#E0E0E0', true: '#1A365D' }}
                thumbColor={'#FFFFFF'}
              />
            </View>
          </View>
        }
      />

      {/* Summary Footer */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({selectedCount} items selected)</Text>
          <Text style={styles.summaryValue}>₱{subtotal.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>₱{shippingCost.toLocaleString()}</Text>
        </View>
        {activeVoucherDiscount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: '#1A365D' }]}>Voucher Discount</Text>
            <Text style={[styles.summaryValue, { color: '#1A365D' }]}>-₱{activeVoucherDiscount.toLocaleString()}</Text>
          </View>
        )}
        {useCoins && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: '#1A365D' }]}>Coins Discount</Text>
            <Text style={[styles.summaryValue, { color: '#1A365D' }]}>-₱{coinsDiscount.toLocaleString()}</Text>
          </View>
        )}
        
        <View style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₱{total.toLocaleString()}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.checkoutBtn, selectedCount === 0 && styles.checkoutBtnDisabled]} 
          onPress={handleCheckout}
          disabled={selectedCount === 0}
        >
          <Text style={styles.checkoutBtnText}>Checkout ({selectedCount} items)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 200, // Make room for fixed footer
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderBottomWidth: 0,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
  },
  itemCardLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginRight: 4,
  },
  freeShippingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBE9E7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  freeShippingText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  box: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  boxHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  boxTitle: {
    fontSize: 14,
    color: '#1A1A1A',
    marginLeft: 8,
  },
  voucherInputRow: {
    flexDirection: 'row',
  },
  voucherInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginRight: 12,
  },
  applyBtn: {
    backgroundColor: '#1A365D',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsInfo: {
    flex: 1,
    marginLeft: 12,
  },
  coinsTitle: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  coinsSubtext: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A365D',
  },
  checkoutBtn: {
    backgroundColor: '#0A1A3A',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutBtnDisabled: {
    backgroundColor: '#CCCCCC',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  shopBtn: {
    backgroundColor: '#FF6B00',
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  shopBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
