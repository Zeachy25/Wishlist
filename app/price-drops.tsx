import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store/useStore';
import SearchProductCard from '../src/components/SearchProductCard';
import { Product } from '../src/types';

export default function PriceDropsScreen() {
  const router = useRouter();
  const alerts = useStore((state) => state.alerts);
  const addToWishlist = useStore((state) => state.addToWishlist);

  // Extract products from alerts
  const products = alerts.map(alert => alert.product).filter(Boolean) as Product[];

  const handleAddWishlist = (product: Product) => {
    addToWishlist(product);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Price Drops</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <SearchProductCard product={item} onAddWishlist={handleAddWishlist} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="tag-off-outline" size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>No price drops at the moment.</Text>
          </View>
        }
      />
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
  gridContainer: {
    padding: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 16,
  },
});
