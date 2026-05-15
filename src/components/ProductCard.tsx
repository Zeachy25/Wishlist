import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Product } from '../types';
import { useStore } from '../store/useStore';

interface ProductCardProps {
  product: Product;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 24; // 2 columns with padding

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const wishlist = useStore((state) => state.wishlist);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const addToCart = useStore((state) => state.addToCart);

  const isWishlisted = wishlist.some((item) => item.product_id === product.id);

  const handleAddToCart = () => {
    if (!product || !product.id) return;
    
    addToCart({
      id: product.id,
      product: product,
      quantity: 1,
      isChecked: true,
      priceAtAdd: product.current_price,
      currentPrice: product.current_price,
    });
  };

  const toggleWishlist = () => {
    if (!product || !product.id) {
      console.warn('toggleWishlist: product is invalid', product);
      return;
    }
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image_url }} style={styles.image} />
        <TouchableOpacity style={styles.heartButton} onPress={toggleWishlist}>
          <MaterialCommunityIcons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={20}
            color={isWishlisted ? '#E53935' : '#666666'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.seller} numberOfLines={1}>
          {product.seller.toUpperCase()}
        </Text>

        <View style={styles.ratingContainer}>
          <MaterialCommunityIcons name="star" size={14} color="#FFB300" />
          <Text style={styles.ratingText}>
            {product.rating} <Text style={styles.reviewCount}>({product.review_count})</Text>
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₱{product.current_price.toLocaleString()}</Text>
          {product.discount_percent ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SAVE ₱{(product.original_price - product.current_price).toLocaleString()}</Text>
            </View>
          ) : (
            <View style={styles.promoBadge}>
              <Text style={styles.promoText}>PROMO</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 4,
    minHeight: 40,
  },
  seller: {
    fontSize: 10,
    color: '#999999',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginLeft: 4,
  },
  reviewCount: {
    fontWeight: 'normal',
    color: '#999999',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  badge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1A56DB',
  },
  promoBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promoText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  addToCartButton: {
    backgroundColor: '#1E3A5F',
    borderRadius: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
