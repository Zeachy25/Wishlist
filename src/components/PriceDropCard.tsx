import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert } from '../types';

interface PriceDropCardProps {
  alert: Alert;
}

export default function PriceDropCard({ alert }: PriceDropCardProps) {
  const router = useRouter();
  const product = alert.product;

  if (!product) return null;

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image_url }} style={styles.image} />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>↓ {alert.drop_percent}%</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>₱{alert.new_price.toLocaleString()}</Text>
            <Text style={styles.originalPrice}>₱{alert.old_price.toLocaleString()}</Text>
          </View>
          
          <View style={styles.bellIconContainer}>
            <MaterialCommunityIcons name="bell-ring-outline" size={16} color="#999999" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
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
    top: 8,
    right: 8,
    backgroundColor: '#27AE60', // Green for price drops
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 10,
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A365D',
  },
  originalPrice: {
    fontSize: 10,
    color: '#999999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  bellIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
