import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SearchProductCard from "../src/components/SearchProductCard";
import { fetchProducts } from "../src/services/supabaseService";
import { useStore } from "../src/store/useStore";
import { Product } from "../src/types";

export default function FlashSaleScreen() {
  const router = useRouter();
  const addToWishlist = useStore((state) => state.addToWishlist);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await fetchProducts();
        // Filter products that have a discount for "Sales"
        const discounted = allProducts.filter(
          (p) => (p.discount_percent ?? 0) > 0,
        );
        setProducts(discounted);
      } catch (error) {
        console.error("Failed to fetch products for flash sale:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);


  const handleAddWishlist = (product: Product) => {
    addToWishlist(product);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flash Sale</Text>
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
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  gridContainer: {
    padding: 12,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
});
