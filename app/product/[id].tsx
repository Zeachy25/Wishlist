import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PriceHistoryChart from "../../src/components/PriceHistoryChart";
import SkeletonLoader from "../../src/components/SkeletonLoader";
import { useFlashSaleTimer } from "../../src/hooks/useFlashSaleTimer";
import {
  fetchProducts,
  getProductById,
  getProductPriceHistory,
} from "../../src/services/supabaseService";
import { useStore } from "../../src/store/useStore";
import { PriceSnapshot, Product } from "../../src/types";

const { width } = Dimensions.get("window");

const ANDROID_STATUS_BAR = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;
const ANDROID_NAV_BAR = Platform.OS === 'android' ? 0 : 0;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<PriceSnapshot[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);

  const { timeLeft } = useFlashSaleTimer();
  const addToCart = useStore((state) => state.addToCart);
  const setBuyNowItem = useStore((state) => state.setBuyNowItem);
  const cartCount = useStore((state) => state.cartCount);
  const followedStores = useStore((state) => state.followedStores);
  const toggleFollowStore = useStore((state) => state.toggleFollowStore);

  const isFollowing = product ? followedStores.includes(product.seller) : false;

  const toastOpacity = useRef(new Animated.Value(0)).current;

  const loadProduct = useCallback(async () => {
    console.log("Loading product with ID:", id);
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getProductById(id as string);
      console.log("Product data result:", data);
      if (data) {
        setProduct(data);
        if (data.variants?.color?.length)
          setSelectedColor(data.variants.color[0]);
        if (data.variants?.storage?.length)
          setSelectedStorage(data.variants.storage[0]);

        const hist = await getProductPriceHistory(id as string);
        setHistory(hist);

        // Fetch related products for "You may also like"
        const related = await fetchProducts();
        setRelatedProducts(related.filter((p) => p.id !== id).slice(0, 5));
      } else {
        setError("Product not found");
      }
    } catch (e: any) {
      console.error("DEBUG - Product load error:", e);
      setError(`Failed to load product: ${e.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentImageIndex(Math.round(index));
  };

  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      // Construct variant string
      let variantStr = "";
      const parts = [];
      if (selectedColor) parts.push(`Color: ${selectedColor}`);
      if (selectedStorage) parts.push(`Storage: ${selectedStorage}`);
      if (parts.length > 0) variantStr = parts.join(", ");

      const cartId = `${product.id}-${variantStr}`;

      await addToCart({
        id: cartId,
        product,
        quantity,
        isChecked: true,
        priceAtAdd: currentPrice,
        currentPrice: currentPrice,
        variant: variantStr || undefined,
      });

      Animated.sequence([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Construct variant string
    let variantStr = "";
    const parts = [];
    if (selectedColor) parts.push(`Color: ${selectedColor}`);
    if (selectedStorage) parts.push(`Storage: ${selectedStorage}`);
    if (parts.length > 0) variantStr = parts.join(", ");

    const cartId = `${product.id}-${variantStr}`;

    setBuyNowItem({
      id: cartId,
      product,
      quantity,
      isChecked: true,
      priceAtAdd: currentPrice,
      currentPrice: currentPrice,
      variant: variantStr || undefined,
    });

    router.push("/checkout");
  };

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    if (
      selectedStorage &&
      product.variantPrices &&
      product.variantPrices[selectedStorage]
    ) {
      return product.variantPrices[selectedStorage];
    }
    return product.current_price;
  }, [product, selectedStorage]);

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
      </TouchableOpacity>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons
            name="share-variant-outline"
            size={24}
            color="#1A1A1A"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push("/(drawer)/(tabs)/cart")}
        >
          <MaterialCommunityIcons
            name="cart-outline"
            size={24}
            color="#1A1A1A"
          />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons
            name="dots-horizontal"
            size={24}
            color="#1A1A1A"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLoading = () => (
    <View style={[styles.loadingContainer, { paddingTop: ANDROID_STATUS_BAR }]}>
      {renderHeader()}
      <SkeletonLoader height={width} style={{ marginBottom: 16 }} />
      <View style={{ padding: 16 }}>
        <SkeletonLoader height={24} width="80%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={24} width="60%" style={{ marginBottom: 16 }} />
        <SkeletonLoader height={32} width="40%" style={{ marginBottom: 24 }} />
        <SkeletonLoader height={100} style={{ marginBottom: 16 }} />
      </View>
    </View>
  );

  const renderError = () => (
    <View
      style={[
        styles.loadingContainer,
        { justifyContent: "center", alignItems: "center" },
      ]}
    >
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={48}
        color="#E53935"
      />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={loadProduct}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return renderLoading();
  if (error || !product) return renderError();

  const images = product.images || [product.image_url];

  return (
    <View style={[styles.container, { paddingTop: ANDROID_STATUS_BAR }]}>
      {renderHeader()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {images.map((url, idx) => (
              <Image
                key={idx}
                source={{ uri: url }}
                style={styles.productImage}
              />
            ))}
          </ScrollView>
          <View style={styles.imageIndicator}>
            <Text style={styles.imageIndicatorText}>
              {currentImageIndex + 1}/{images.length}
            </Text>
          </View>
          <View style={styles.dotsContainer}>
            {images.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  currentImageIndex === idx && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Title & Ratings */}
        <View style={styles.section}>
          <View style={styles.storeBadge}>
            <Text style={styles.storeBadgeText}>OFFICIAL STORE</Text>
          </View>
          <Text style={styles.title}>{product.name}</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <MaterialCommunityIcons
                key={star}
                name="star"
                size={14}
                color={
                  star <= Math.round(product.rating) ? "#FFB300" : "#E0E0E0"
                }
              />
            ))}
            <Text style={styles.ratingText}>
              {product.rating}{" "}
              <Text style={{ color: "#999" }}>
                · {product.review_count.toLocaleString()} ratings ·{" "}
                {product.sold_count?.toLocaleString() || 0} sold
              </Text>
            </Text>
          </View>
        </View>

        {/* Flash Sale Banner */}
        <View style={styles.flashSaleBanner}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.flashSaleText}>Flash Sale ends in</Text>
          </View>
          <View style={styles.timerRow}>
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

        {/* Price Section */}
        <View style={styles.section}>
          <Text style={styles.price}>₱{currentPrice.toLocaleString()}</Text>
          <Text style={styles.originalPrice}>
            ₱{product.original_price.toLocaleString()}
          </Text>
          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <View style={styles.savePill}>
              <Text style={styles.saveText}>
                You save ₱
                {(product.original_price - currentPrice).toLocaleString()} -{" "}
                {Math.round((1 - currentPrice / product.original_price) * 100)}%
                off!
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Variants */}
        {product.variants && (
          <View style={styles.section}>
            {product.variants.color && (
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.variantLabel}>
                  Color:{" "}
                  <Text style={{ fontWeight: "bold", color: "#1A1A1A" }}>
                    {selectedColor}
                  </Text>
                </Text>
                <View style={{ flexDirection: "row" }}>
                  {product.variants.color.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.variantBtn,
                        selectedColor === color && styles.variantBtnActive,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      <Text
                        style={[
                          styles.variantText,
                          selectedColor === color && styles.variantTextActive,
                        ]}
                      >
                        {color}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            {product.variants.storage && (
              <View>
                <Text style={styles.variantLabel}>
                  Storage:{" "}
                  <Text style={{ fontWeight: "bold", color: "#1A1A1A" }}>
                    {selectedStorage}
                  </Text>
                </Text>
                <View style={{ flexDirection: "row" }}>
                  {product.variants.storage.map((storage) => (
                    <TouchableOpacity
                      key={storage}
                      style={[
                        styles.variantBtn,
                        selectedStorage === storage && styles.variantBtnActive,
                      ]}
                      onPress={() => setSelectedStorage(storage)}
                    >
                      <Text
                        style={[
                          styles.variantText,
                          selectedStorage === storage &&
                            styles.variantTextActive,
                        ]}
                      >
                        {storage}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.divider} />

        {/* Quantity & Seller */}
        <View style={styles.section}>
          <View style={styles.sellerRow}>
            <View style={styles.sellerLogo}>
              <MaterialCommunityIcons
                name="storefront-outline"
                size={24}
                color="#1A365D"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.sellerName}>{product.seller}</Text>
              <Text style={styles.sellerMeta}>
                98.5% Positive | Response: Fast
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.followBtn,
                isFollowing && {
                  backgroundColor: "#F5F5F5",
                  borderColor: "#CCCCCC",
                },
              ]}
              onPress={() => product && toggleFollowStore(product.seller)}
            >
              <Text
                style={[styles.followText, isFollowing && { color: "#666666" }]}
              >
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quantityRow}>
            <Text style={{ fontSize: 14, color: "#1A1A1A", marginRight: 16 }}>
              Quantity
            </Text>
            <View style={styles.qtyControl}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.qtyBtn}
              >
                <MaterialCommunityIcons
                  name="minus"
                  size={16}
                  color="#1A1A1A"
                />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={styles.qtyBtn}
              >
                <MaterialCommunityIcons name="plus" size={16} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: "#E53935", marginLeft: 16 }}>
              Only 5 left in stock!
            </Text>
          </View>
        </View>

        {/* Price History Section */}
        <View style={styles.historyContainer}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={styles.historyTitle}>
              Price History — Last 30 Days
            </Text>
            <MaterialCommunityIcons
              name="information-outline"
              size={16}
              color="#FFFFFF"
              style={{ marginLeft: 8 }}
            />
          </View>

          <PriceHistoryChart data={history} />

          <TouchableOpacity
            style={styles.setAlertBtn}
            onPress={() =>
              router.push({
                pathname: "/modals/set-alert",
                params: {
                  productId: product.id,
                  productName: product.name,
                  currentPrice,
                },
              })
            }
          >
            <MaterialCommunityIcons
              name="bell-ring-outline"
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.setAlertText}>Set Price Alert</Text>
          </TouchableOpacity>
          <Text style={styles.historyFooter}>
            ↓ Price checked every 30 mins · Powered by WishList AI
          </Text>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#1A1A1A",
              marginBottom: 12,
            }}
          >
            About this item
          </Text>
          {product.description.split("\n").map((line, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                marginBottom: 8,
                paddingRight: 16,
              }}
            >
              <Text style={{ color: "#666", marginRight: 8 }}>•</Text>
              <Text style={{ color: "#444", lineHeight: 20 }}>{line}</Text>
            </View>
          ))}
          <TouchableOpacity style={{ marginTop: 8 }}>
            <Text style={{ color: "#1A365D", fontWeight: "bold" }}>
              See more <MaterialCommunityIcons name="chevron-down" size={14} />
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Ratings & Reviews */}
        <View style={styles.section}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#1A1A1A",
              marginBottom: 16,
            }}
          >
            Ratings & Reviews
          </Text>
          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <View style={{ alignItems: "center", marginRight: 24 }}>
              <Text
                style={{ fontSize: 40, fontWeight: "bold", color: "#1A1A1A" }}
              >
                {product.rating}
              </Text>
              <View style={{ flexDirection: "row", marginVertical: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <MaterialCommunityIcons
                    key={star}
                    name="star"
                    size={12}
                    color={
                      star <= Math.round(product.rating) ? "#FFB300" : "#E0E0E0"
                    }
                  />
                ))}
              </View>
              <Text style={{ fontSize: 10, color: "#666" }}>
                {product.review_count.toLocaleString()} reviews
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <View style={styles.ratingBarRow}>
                <Text style={styles.ratingBarText}>5</Text>
                <View style={styles.ratingBarBg}>
                  <View style={[styles.ratingBarFill, { width: "80%" }]} />
                </View>
              </View>
              <View style={styles.ratingBarRow}>
                <Text style={styles.ratingBarText}>4</Text>
                <View style={styles.ratingBarBg}>
                  <View style={[styles.ratingBarFill, { width: "15%" }]} />
                </View>
              </View>
              <View style={styles.ratingBarRow}>
                <Text style={styles.ratingBarText}>3</Text>
                <View style={styles.ratingBarBg}>
                  <View style={[styles.ratingBarFill, { width: "5%" }]} />
                </View>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", marginBottom: 24 }}>
            {["All", "5 ★", "4 ★", "With Photos"].map((pill, i) => (
              <TouchableOpacity
                key={pill}
                style={[
                  styles.reviewFilterPill,
                  i === 0 && {
                    backgroundColor: "#1A365D",
                    borderColor: "#1A365D",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.reviewFilterText,
                    i === 0 && { color: "#FFFFFF" },
                  ]}
                >
                  {pill}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sample Review */}
          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <View style={styles.reviewerAvatar}>
                <Text style={{ color: "#1A365D", fontWeight: "bold" }}>J</Text>
              </View>
              <View>
                <Text
                  style={{ fontSize: 12, fontWeight: "bold", color: "#1A1A1A" }}
                >
                  John D.
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <MaterialCommunityIcons
                      key={star}
                      name="star"
                      size={10}
                      color="#FFB300"
                    />
                  ))}
                  <Text style={{ fontSize: 10, color: "#999", marginLeft: 8 }}>
                    2 days ago
                  </Text>
                </View>
              </View>
            </View>
            <Text
              style={{
                fontSize: 13,
                color: "#444",
                lineHeight: 18,
                marginBottom: 8,
              }}
            >
              The noise cancellation is actually insane. Upgraded from the XM3
              and the difference in voice frequency suppression is noticeable.
              Fast shipping too!
            </Text>
            <Image
              source={{ uri: product.image_url }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 8,
                marginBottom: 8,
              }}
            />
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <MaterialCommunityIcons
                name="thumb-up-outline"
                size={14}
                color="#666"
              />
              <Text style={{ fontSize: 12, color: "#666", marginLeft: 4 }}>
                Helpful (24)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* You May Also Like */}
        <View style={styles.section}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#1A1A1A",
              marginBottom: 16,
            }}
          >
            You May Also Like
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -16 }}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {relatedProducts.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.relatedCard}
                onPress={() => router.push(`/product/${p.id}`)}
              >
                <Image
                  source={{ uri: p.image_url }}
                  style={styles.relatedImage}
                />
                <View style={{ padding: 8 }}>
                  <Text style={styles.relatedName} numberOfLines={2}>
                    {p.name}
                  </Text>
                  <Text style={styles.relatedPrice}>
                    ₱{p.current_price.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 48) + 8 }]}>
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={handleAddToCart}
          disabled={addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator color="#1A365D" />
          ) : (
            <Text style={styles.addToCartText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      {/* Toast */}
      <Animated.View
        style={[styles.toast, { opacity: toastOpacity }]}
        pointerEvents="none"
      >
        <MaterialCommunityIcons
          name="check-circle"
          size={20}
          color="#FFFFFF"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.toastText}>Added to Cart</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  loadingContainer: { flex: 1, backgroundColor: "#FFFFFF" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 0,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerRight: { flexDirection: "row" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  cartBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#E53935",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "bold" },
  carouselContainer: { position: "relative", width: width, height: width },
  productImage: { width: width, height: width, resizeMode: "cover" },
  imageIndicator: {
    position: "absolute",
    top: 65, // Moved down
    right: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageIndicatorText: { color: "#FFFFFF", fontSize: 12, fontWeight: "bold" },
  dotsContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.2)",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "#1A365D",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  section: { padding: 16 },
  storeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1A365D",
  },
  storeBadgeText: { color: "#1A365D", fontSize: 10, fontWeight: "bold" },
  title: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
    lineHeight: 22,
    marginBottom: 8,
  },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: { marginLeft: 8, fontSize: 12, color: "#1A1A1A" },
  flashSaleBanner: {
    backgroundColor: "#E53935",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flashSaleText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 4,
  },
  timerRow: { flexDirection: "row", alignItems: "center" },
  timeBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: "center",
  },
  timeText: { color: "#E53935", fontSize: 12, fontWeight: "bold" },
  timeColon: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginHorizontal: 4,
    fontSize: 14,
  },
  price: { fontSize: 28, fontWeight: "bold", color: "#1A1A1A" },
  originalPrice: {
    fontSize: 14,
    color: "#999999",
    textDecorationLine: "line-through",
    marginTop: 4,
  },
  savePill: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saveText: { color: "#27AE60", fontSize: 12, fontWeight: "bold" },
  divider: { height: 8, backgroundColor: "#F5F5F5" },
  variantLabel: { fontSize: 14, color: "#666666", marginBottom: 8 },
  variantBtn: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  variantBtnActive: { borderColor: "#1A365D", backgroundColor: "#EDF2FA" },
  variantText: { color: "#1A1A1A", fontSize: 13 },
  variantTextActive: { color: "#1A365D", fontWeight: "bold" },
  sellerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  sellerLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  sellerName: { fontSize: 14, fontWeight: "bold", color: "#1A1A1A" },
  sellerMeta: { fontSize: 12, color: "#666666", marginTop: 2 },
  followBtn: {
    borderWidth: 1,
    borderColor: "#1A365D",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  followText: { color: "#1A365D", fontSize: 12, fontWeight: "bold" },
  quantityRow: { flexDirection: "row", alignItems: "center" },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
  },
  qtyBtn: { padding: 8 },
  qtyText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  historyContainer: {
    backgroundColor: "#1A365D",
    padding: 16,
    paddingVertical: 24,
  },
  historyTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  setAlertBtn: {
    flexDirection: "row",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  setAlertText: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  historyFooter: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    textAlign: "center",
    marginTop: 16,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  addToCartBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#1A365D",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    paddingVertical: 14,
  },
  addToCartText: { color: "#1A365D", fontSize: 16, fontWeight: "bold" },
  buyNowBtn: {
    flex: 1,
    backgroundColor: "#1A365D",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },
  buyNowText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  errorText: {
    color: "#E53935",
    marginTop: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  retryBtn: {
    borderWidth: 1,
    borderColor: "#1A365D",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  retryText: { color: "#1A365D", fontWeight: "bold" },
  toast: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "rgba(39, 174, 96, 0.9)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  toastText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  ratingBarRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  ratingBarText: { fontSize: 10, color: "#666", width: 12, marginRight: 4 },
  ratingBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#EEEEEE",
    borderRadius: 3,
  },
  ratingBarFill: { height: 6, backgroundColor: "#FFB300", borderRadius: 3 },
  reviewFilterPill: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  reviewFilterText: { fontSize: 12, color: "#1A1A1A" },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  relatedCard: {
    width: 120,
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    overflow: "hidden",
  },
  relatedImage: { width: "100%", height: 120, backgroundColor: "#F5F5F5" },
  relatedName: { fontSize: 11, color: "#1A1A1A", marginBottom: 4, height: 30 },
  relatedPrice: { fontSize: 13, fontWeight: "bold", color: "#1A365D" },
});
