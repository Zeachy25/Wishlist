import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { filterByTimeWindow } from "../src/algorithms/priceProcessor";
import SearchProductCard from "../src/components/SearchProductCard";
import { useStore } from "../src/store/useStore";
import { Product } from "../src/types";

export default function PriceDropsScreen() {
  const router = useRouter();
  const alerts = useStore((state) => state.alerts);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const [showRecentOnly, setShowRecentOnly] = useState(false);

  const filteredAlerts = showRecentOnly
    ? alerts.filter(
        (a) =>
          filterByTimeWindow(
            [{ price: a.new_price, timestamp: a.triggered_at }],
            48,
          ).length > 0,
      )
    : alerts;

  // Deduplicate products by ID and get the latest alert for each product
  const productMap = new Map<string, (typeof filteredAlerts)[0]>();
  filteredAlerts.forEach((alert) => {
    if (alert.product?.id) {
      const existing = productMap.get(alert.product.id);
      // Keep the most recent alert for each product
      if (
        !existing ||
        new Date(alert.triggered_at) > new Date(existing.triggered_at)
      ) {
        productMap.set(alert.product.id, alert);
      }
    }
  });

  const products = Array.from(productMap.values())
    .map((alert) => alert.product)
    .filter(Boolean) as Product[];

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
        <TouchableOpacity onPress={() => setShowRecentOnly(!showRecentOnly)}>
          <MaterialCommunityIcons
            name={showRecentOnly ? "filter" : "filter-outline"}
            size={24}
            color={showRecentOnly ? "#1A365D" : "#666"}
          />
        </TouchableOpacity>
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
        ListHeaderComponent={
          showRecentOnly ? (
            <Text style={styles.filterStatus}>Showing last 48 hours</Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="tag-off-outline"
              size={64}
              color="#E0E0E0"
            />
            <Text style={styles.emptyText}>
              No price drops{" "}
              {showRecentOnly ? "in the last 48 hours" : "at the moment"}.
            </Text>
          </View>
        }
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
  filterStatus: {
    padding: 16,
    fontSize: 14,
    color: "#1A365D",
    fontWeight: "bold",
    textAlign: "center",
  },
  gridContainer: {
    padding: 12,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#999999",
    marginTop: 16,
  },
});
