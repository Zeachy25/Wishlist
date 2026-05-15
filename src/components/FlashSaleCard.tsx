import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface FlashSaleCardProps {
  item: {
    id: string;
    product_id: string;
    name: string;
    image_url: string;
    current_price: number;
    original_price: number;
    discount_percent: number;
    claimed_percent: number;
  };
}

export default function FlashSaleCard({ item }: FlashSaleCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/product/${item.product_id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image_url }} style={styles.image} />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{item.discount_percent}%</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.price}>₱{item.current_price.toLocaleString()}</Text>
        <Text style={styles.originalPrice}>₱{item.original_price.toLocaleString()}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${item.claimed_percent}%` }]} />
          </View>
          <Text style={styles.claimedText}>{item.claimed_percent}% CLAIMED</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B00', // Amazon/Lazada style orange
    marginBottom: 2,
  },
  originalPrice: {
    fontSize: 10,
    color: '#999999',
    textDecorationLine: 'line-through',
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#EEEEEE',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B00',
  },
  claimedText: {
    fontSize: 9,
    color: '#FF6B00',
    fontWeight: 'bold',
  },
});
