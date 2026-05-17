import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFlashSaleTimer } from "../../src/hooks/useFlashSaleTimer";
import { fetchProducts } from "../../src/services/supabaseService";
import { useStore } from "../../src/store/useStore";
import { Product } from "../../src/types";

import FlashSaleCard from "../../src/components/FlashSaleCard";
import PriceDropCard from "../../src/components/PriceDropCard";
import ProductCard from "../../src/components/ProductCard";
import SkeletonLoader from "../../src/components/SkeletonLoader";

const { width } = Dimensions.get("window");

const CATEGORIES = [
  { id: "1", name: "Electronics", icon: "monitor-cellphone" },
  { id: "2", name: "Fashion", icon: "tshirt-crew-outline" },
  { id: "3", name: "Home", icon: "home-outline" },
  { id: "4", name: "Beauty", icon: "lipstick" },
  { id: "5", name: "Sports", icon: "soccer" },
  { id: "6", name: "Toys", icon: "robot-outline" },
];

export default function HomeScreen() {
  const router = useRouter();
  const alerts = useStore((state) => state.alerts);
  const unreadCount = useStore((state) => state.unreadCount);

  const { timeLeft } = useFlashSaleTimer();

  const [products, setProducts] = useState<Product[]>([]);
  const [flashSales, setFlashSales] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      setProducts(data);
      // Use products with discount as flash sales
      setFlashSales(data.filter(p => (p.discount_percent ?? 0) > 0).slice(0, 6));
    } catch (err) {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleSearchPress = () => {
    // According to specs, tapping search bar navigates to browse
    router.push("/(tabs)/browse");
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.logoText}>WishList</Text>
        <View style={{ flex: 1 }} />
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color="#1A1A1A"
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.searchBar}
        onPress={handleSearchPress}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="magnify" size={20} color="#999" />
        <Text style={styles.searchText}>
          Search products, brands, sellers
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHero = () => (
    <View style={styles.heroContainer}>
      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>12.12 Mega Sale</Text>
        <Text style={styles.heroSubtitle}>Up to 70% off</Text>
        <TouchableOpacity style={styles.shopNowBtn}>
          <Text style={styles.shopNowText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
      {/* Pagination dots */}
      <View style={styles.pagination}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );

  const renderFlashSale = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={20}
            color="#E53935"
          />
          <Text style={[styles.sectionTitle, { color: "#E53935" }]}>
            Flash Sale
          </Text>
          <View style={styles.timerContainer}>
            {timeLeft.split(" : ").map((part, i) => (
              <React.Fragment key={i}>
                <View style={styles.timeBox}>
                  <Text style={styles.timeText}>{part}</Text>
                </View>
                {i < 2 && <Text style={styles.timeColon}>:</Text>}
              </React.Fragment>
            ))}
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push("/flash-sale")}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hScroll}
      >
        {flashSales.map((item) => (
          <FlashSaleCard 
            key={item.id} 
            item={{
              id: item.id,
              product_id: item.id,
              name: item.name,
              image_url: item.image_url,
              current_price: item.current_price,
              original_price: item.original_price,
              discount_percent: item.discount_percent || 0,
              claimed_percent: Math.floor(Math.random() * 40) + 60 // Simulated for now
            }} 
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      {CATEGORIES.map((cat) => (
        <TouchableOpacity key={cat.id} style={styles.categoryItem}>
          <View style={styles.categoryIconBg}>
            <MaterialCommunityIcons
              name={cat.icon as any}
              size={24}
              color="#1A56DB"
            />
          </View>
          <Text style={styles.categoryText}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPromos = () => (
    <View style={styles.promosContainer}>
      <TouchableOpacity
        style={[styles.promoBox, { backgroundColor: "#FFFFFF" }]}
      >
        <Text style={styles.promoTitle}>Collect Vouchers</Text>
        <Text style={styles.promoSubtitle}>Savings up to â‚±500</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.promoBox, { backgroundColor: "#FFFFFF" }]}
      >
        <Text style={styles.promoTitle}>Daily Check-in</Text>
        <Text style={styles.promoSubtitle}>+10 coins today</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.promoBox, { backgroundColor: "#1A365D" }]}
      >
        <Text style={[styles.promoTitle, { color: "#FFFFFF" }]}>
          WatchList Coins
        </Text>
        <Text style={[styles.promoSubtitle, { color: "#E0E0E0" }]}>
          240 available
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPriceDrops = () => {
    if (!alerts || alerts.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons
              name="tag-outline"
              size={20}
              color="#27AE60"
              style={{ transform: [{ rotate: "-45deg" }] }}
            />
            <Text style={styles.sectionTitle}>Price Drops for You</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/price-drops")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {alerts.map((alert) => (
            <PriceDropCard key={alert.id} alert={alert} />
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderRecommended = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
        Recommended For You
      </Text>
      <View style={styles.gridContainer}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <SkeletonLoader
        height={150}
        borderRadius={8}
        style={{ marginBottom: 16 }}
      />
      <View style={styles.gridContainer}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ width: width / 2 - 24, marginBottom: 16 }}>
            <SkeletonLoader
              height={width / 2 - 24}
              borderRadius={8}
              style={{ marginBottom: 8 }}
            />
            <SkeletonLoader
              height={16}
              width="80%"
              style={{ marginBottom: 4 }}
            />
            <SkeletonLoader height={14} width="50%" />
          </View>
        ))}
      </View>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={48}
        color="#E53935"
      />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadData}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <MaterialCommunityIcons
        name="package-variant"
        size={48}
        color="#999999"
      />
      <Text style={styles.emptyText}>No products found.</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadData}>
        <Text style={styles.retryText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B00"]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {renderHero()}
        {renderFlashSale()}
        {renderCategories()}
        {renderPromos()}
        {renderPriceDrops()}

        {loading
          ? renderLoadingState()
          : error
            ? renderErrorState()
            : products.length === 0
              ? renderEmptyState()
              : renderRecommended()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0A2458",
    letterSpacing: -0.5,
    marginRight: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchText: {
    color: "#999999",
    fontSize: 14,
    marginLeft: 8,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    position: "relative",
    padding: 4,
    marginLeft: 8,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#E53935",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "bold",
  },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
    marginRight: 4,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroBanner: {
    backgroundColor: "#1E3A5F", // Dark blue gradient fallback
    borderRadius: 8,
    padding: 24,
    height: 160,
    justifyContent: "center",
    overflow: "hidden",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  shopNowBtn: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shopNowText: {
    color: "#1E3A5F",
    fontWeight: "bold",
    fontSize: 12,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D9D9D9",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "#1A365D",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginLeft: 4,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  timeBox: {
    backgroundColor: "#1A1A1A",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: "center",
  },
  timeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  timeColon: {
    color: "#1A1A1A",
    fontWeight: "bold",
    marginHorizontal: 2,
    fontSize: 12,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1A365D",
  },
  hScroll: {
    paddingBottom: 8,
    paddingRight: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 20,
  },
  categoryItem: {
    width: "16%",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EDF2FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    color: "#1A1A1A",
    textAlign: "center",
  },
  promosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 12,
  },
  promoBox: {
    width: "31%",
    borderRadius: 8,
    padding: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  promoTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 9,
    color: "#666666",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  loadingContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 20,
  },
  errorText: {
    color: "#E53935",
    marginTop: 12,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyText: {
    color: "#999999",
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: "#1A365D",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  retryText: {
    color: "#1A365D",
    fontWeight: "bold",
  },
});

