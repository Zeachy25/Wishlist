import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStore } from '../../src/store/useStore';

export default function SetAlertModal() {
  const router = useRouter();
  const { productId, productName, currentPrice } = useLocalSearchParams();
  const setTargetPrice = useStore((state) => state.setTargetPrice);

  const priceNum = currentPrice ? Number(currentPrice) : 0;
  
  const [target, setTarget] = useState<string>('');

  const handleSave = () => {
    if (productId && target) {
      setTargetPrice(productId as string, Number(target));
      router.back();
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Price Alert</Text>
        <TouchableOpacity onPress={handleSave} disabled={!target}>
          <Text style={[styles.saveText, !target && styles.disabledText]}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{productName || 'Product'}</Text>
          <Text style={styles.currentPrice}>Current Price: ₱{priceNum.toLocaleString()}</Text>
        </View>

        <Text style={styles.label}>Target Price (₱)</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="currency-php" size={24} color="#666" />
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g. 15000"
            value={target}
            onChangeText={setTarget}
            autoFocus
          />
        </View>

        <View style={styles.suggestionsRow}>
          <TouchableOpacity 
            style={styles.suggestionPill}
            onPress={() => setTarget(Math.floor(priceNum * 0.9).toString())}
          >
            <Text style={styles.suggestionText}>-10% (₱{Math.floor(priceNum * 0.9).toLocaleString()})</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.suggestionPill}
            onPress={() => setTarget(Math.floor(priceNum * 0.8).toString())}
          >
            <Text style={styles.suggestionText}>-20% (₱{Math.floor(priceNum * 0.8).toLocaleString()})</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  cancelText: {
    fontSize: 16,
    color: '#666666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A365D',
  },
  disabledText: {
    color: '#CCCCCC',
  },
  body: {
    padding: 16,
  },
  productInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  productName: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53935',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 18,
    marginLeft: 8,
    color: '#1A1A1A',
  },
  suggestionsRow: {
    flexDirection: 'row',
  },
  suggestionPill: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    color: '#1A365D',
    fontSize: 12,
    fontWeight: '500',
  },
});
