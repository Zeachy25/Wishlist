import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Product } from '../types';

interface SearchProductCardProps {
  product: Product;
  onAddWishlist: (product: Product) => void;
}

const { width } = Dimensions.get('window');
// Using 2 columns with some padding
const CARD_WIDTH = (width - 36) / 2; 

export default function SearchProductCard({ product, onAddWishlist }: SearchProductCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  const handleWishlistPress = () => {
    onAddWishlist(product);
  };

  const isOfficial = product.seller.toLowerCase().includes('official') || product.seller.toLowerCase().includes('authorized');

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image_url }} style={styles.image} />
        
        {isOfficial && (
          <View style={styles.officialBadge}>
            <Text style={styles.officialText}>OFFICIAL STORE</Text>
          </View>
        )}

        {product.discount_percent ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount_percent}%</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.ratingRow}>
          <MaterialCommunityIcons name="star-outline" size={12} color="#FFB300" />
          <Text style={styles.ratingText}>
            {product.rating.toFixed(1)} <Text style={styles.soldText}>· ({product.review_count} sold)</Text>
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>₱{product.current_price.toLocaleString()}</Text>
          {product.discount_percent ? (
            <Text style={styles.originalPrice}>₱{product.original_price.toLocaleString()}</Text>
          ) : null}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.freeShippingPill}>
            <Text style={styles.freeShippingText}>Free Shipping</Text>
          </View>

          <TouchableOpacity style={styles.bellButton} onPress={handleWishlistPress}>
            <MaterialCommunityIcons name="bell-outline" size={16} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
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
  officialBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#27AE60',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  officialText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#E53935',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 10,
  },
  title: {
    fontSize: 13,
    color: '#1A1A1A',
    lineHeight: 18,
    height: 36, // Force two lines height roughly
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 11,
    color: '#FFB300',
    marginLeft: 2,
  },
  soldText: {
    color: '#666666',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 10,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  freeShippingPill: {
    borderWidth: 1,
    borderColor: '#27AE60',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  freeShippingText: {
    color: '#27AE60',
    fontSize: 9,
    fontWeight: '500',
  },
  bellButton: {
    padding: 2,
  },
});
