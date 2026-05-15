import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet
} from "react-native";
import SearchProductCard from "../src/components/SearchProductCard";
import { mockProducts } from "../src/services/mockData";
import { useStore } from "../src/store/useStore";
import { Product } from "../src/types";

const { width } = Dimensions.get("window");

export default function FlashSaleScreen() {
  const router = useRouter();
  const addToWishlist = useStore((state) => state.addToWishlist);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Filter products that have a discount for "Sales"
    const discounted = mockProducts.filter(
      (p) => (p.discount_percent ?? 0) > 0,
    );
    setProducts(discounted);
  }, []);

  const handleAddWishlist = (product: Product) => {
    addToWishlist(product);
  };

  return (
    <SafeAreaView style={styles.container}>
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
  gridContainer: {
    padding: 12,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
});
