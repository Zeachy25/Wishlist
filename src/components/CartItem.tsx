import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CartItemType } from '../types';

interface CartItemProps {
  item: CartItemType;
  onToggle: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, onToggle, onUpdateQuantity, onRemove }: CartItemProps) {
  const { product, quantity, isChecked, priceAtAdd, currentPrice, variant } = item;

  const handleRemove = () => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onRemove(item.id) },
      ]
    );
  };

  const handleDecrement = () => {
    if (quantity === 1) {
      handleRemove();
    } else {
      onUpdateQuantity(item.id, quantity - 1);
    }
  };

  const hasPriceChanged = currentPrice !== priceAtAdd;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.checkboxContainer} onPress={() => onToggle(item.id)}>
        <MaterialCommunityIcons
          name={isChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={24}
          color={isChecked ? '#1A365D' : '#999999'}
        />
      </TouchableOpacity>

      <View style={styles.detailsContainer}>
        <View style={styles.row}>
          <Image source={{ uri: product.image_url }} style={styles.image} />
          <View style={styles.info}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={2}>{product.name}</Text>
              <TouchableOpacity onPress={handleRemove} style={styles.trashBtn}>
                <MaterialCommunityIcons name="delete-outline" size={20} color="#666666" />
              </TouchableOpacity>
            </View>
            
            {variant && <Text style={styles.variant}>{variant}</Text>}
            
            <View style={styles.priceRow}>
              <Text style={styles.price}>₱{currentPrice.toLocaleString()}</Text>
              {product.original_price > currentPrice && (
                <Text style={styles.originalPrice}>₱{product.original_price.toLocaleString()}</Text>
              )}
            </View>
          </View>
        </View>

        {hasPriceChanged && (
          <View style={styles.warningBox}>
            <MaterialCommunityIcons name="alert-outline" size={16} color="#E65100" />
            <Text style={styles.warningText}>
              Price updated from ₱{priceAtAdd.toLocaleString()} to ₱{currentPrice.toLocaleString()}. Item still in cart.
            </Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <View style={styles.qtyControl}>
            <TouchableOpacity onPress={handleDecrement} style={styles.qtyBtn}>
              <MaterialCommunityIcons name="minus" size={16} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity onPress={() => onUpdateQuantity(item.id, quantity + 1)} style={styles.qtyBtn}>
              <MaterialCommunityIcons name="plus" size={16} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  detailsContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
    marginRight: 8,
  },
  trashBtn: {
    padding: 4,
  },
  variant: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A365D',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
    padding: 8,
    marginTop: 12,
  },
  warningText: {
    fontSize: 11,
    color: '#E65100',
    marginLeft: 6,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    overflow: 'hidden',
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  qtyText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
    minWidth: 20,
    textAlign: 'center',
  },
});
