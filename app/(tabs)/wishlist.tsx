import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../../src/store/useStore';
import { useRouter, useFocusEffect } from 'expo-router';

export default function WishlistScreen() {
  const router = useRouter();
  const user = useStore(state => state.user);
  const wishlist = useStore(state => state.wishlist);
  const loadUserData = useStore(state => state.loadUserData);
  const removeFromWishlist = useStore(state => state.removeFromWishlist);
  const addToCart = useStore(state => state.addToCart);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadUserData(user.id);
      }
    }, [user?.id, loadUserData])
  );

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      product: product,
      quantity: 1,
      isChecked: true,
      priceAtAdd: product.current_price,
      currentPrice: product.current_price
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Wishlist</Text>
          <Text style={styles.headerSubtitle}>{wishlist.length} Items saved to your list</Text>
        </View>
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterBtn}>
            <MaterialCommunityIcons name="sort-variant" size={20} color="#1A365D" style={styles.filterIcon} />
            <Text style={styles.filterText}>Recently Added</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="filter-variant" size={20} color="#1A365D" />
          </TouchableOpacity>
        </View>
      </View>

      {wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="heart-outline" size={80} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtext}>Save items you want to buy later.</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)/browse')}>
            <Text style={styles.shopBtnText}>Start Browsing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {wishlist.map((item) => {
            const product = item.product;
            if (!product) return null;

            const isDiscounted = product.original_price > product.current_price;
            const discountAmount = product.original_price - product.current_price;

            return (
              <View key={item.product_id} style={styles.card}>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: product.image_url }} style={styles.image} />
                  {isDiscounted && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        ₱{discountAmount.toLocaleString()} OFF
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.infoContainer}>
                  <View style={styles.titleRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <TouchableOpacity onPress={() => removeFromWishlist(product.id)}>
                      <MaterialCommunityIcons name="heart" size={22} color="#C62828" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.brand} numberOfLines={1}>
                    Brand: {product.seller}
                  </Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₱{product.current_price.toLocaleString()}</Text>
                    {isDiscounted && (
                      <Text style={styles.oldPrice}>₱{product.original_price.toLocaleString()}</Text>
                    )}
                  </View>

                  {isDiscounted && (
                    <View style={styles.cheaperRow}>
                      <MaterialCommunityIcons name="trending-down" size={14} color="#C62828" />
                      <Text style={styles.cheaperText}>
                        ₱{discountAmount.toLocaleString()} cheaper than when added
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity 
                    style={styles.addToCartBtn} 
                    onPress={() => handleAddToCart(product)}
                  >
                    <MaterialCommunityIcons name="cart-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F8F9FA',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A1A3A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 12,
    color: '#1A365D',
    fontWeight: '500',
  },
  iconBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 6,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  imageContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#F5F5F5',
    position: 'relative',
    margin: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#C62828',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0A1A3A',
    marginRight: 8,
  },
  brand: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A1A3A',
    marginRight: 8,
  },
  oldPrice: {
    fontSize: 12,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  cheaperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cheaperText: {
    fontSize: 10,
    color: '#C62828',
    marginLeft: 4,
    fontWeight: '500',
  },
  addToCartBtn: {
    flexDirection: 'row',
    backgroundColor: '#1E3A5F',
    borderRadius: 20,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#1E3A5F',
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
