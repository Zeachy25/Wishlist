import { supabase } from "../../config/supabaseConfig";
import {
  CircularBuffer,
  calculateAnomaly,
  filterByTimeWindow,
} from "../algorithms/priceProcessor";
import { Alert, CartItemType, Product, WishlistItem } from "../types";

export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }

  return data || [];
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }

  return data;
};

export const fetchAlerts = async (userId: string): Promise<Alert[]> => {
  const { data, error } = await supabase
    .from("alerts")
    .select("*, products(*)")
    .eq("user_id", userId)
    .order("triggered_at", { ascending: false });

  if (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }

  return (data || []).map((item) => ({
    id: item.id,
    product_id: item.product_id,
    old_price: item.old_price,
    new_price: item.new_price,
    drop_percent: item.drop_percent,
    z_score: item.z_score,
    triggered_at: item.triggered_at,
    is_read: item.is_read,
    product: item.products,
  }));
};

export const fetchWishlist = async (
  userId: string,
): Promise<WishlistItem[]> => {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("*, products(*)")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }

  return (data || []).map((item) => ({
    product_id: item.product_id,
    added_at: item.added_at,
    target_price: item.target_price,
    product: item.products,
  }));
};

export const fetchCartItems = async (
  userId: string,
): Promise<CartItemType[]> => {
  const { data, error } = await supabase
    .from("cart_items")
    .select("*, products(*)")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching cart items:", error);
    return [];
  }

  return (data || []).map((item) => ({
    id: item.id,
    product: item.products,
    quantity: item.quantity,
    isChecked: item.is_checked,
    priceAtAdd: item.price_at_add,
    currentPrice: item.products.current_price,
    variant: item.variant,
  }));
};

export const getProductPriceHistory = async (productId: string) => {
  const { data, error } = await supabase
    .from("price_snapshots")
    .select("*")
    .eq("product_id", productId)
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("Error fetching price history:", error);
    return [];
  }

  return data || [];
};

export const searchProducts = async (
  query: string,
  pageNum: number,
  pageSize: number,
): Promise<{ data: Product[]; totalCount: number }> => {
  let supabaseQuery = supabase.from("products").select("*", { count: "exact" });

  if (query) {
    supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
  }

  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabaseQuery
    .range(from, to)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error searching products:", error);
    return { data: [], totalCount: 0 };
  }

  return {
    data: data || [],
    totalCount: count || 0,
  };
};

// Record a price snapshot for a product
export const recordPriceSnapshot = async (
  productId: string,
  price: number,
): Promise<boolean> => {
  try {
    const { error } = await supabase.from("price_snapshots").insert({
      product_id: productId,
      price: price,
    });

    if (error) {
      console.error("Error recording price snapshot:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error recording price snapshot:", err);
    return false;
  }
};

// Initialize price snapshot for newly wishlist-added product
export const initializePriceSnapshot = async (
  productId: string,
): Promise<boolean> => {
  try {
    const product = await getProductById(productId);
    if (!product) return false;

    // Check if product already has snapshots
    const history = await getProductPriceHistory(productId);
    if (history.length === 0) {
      // Create initial snapshot with current price
      return recordPriceSnapshot(productId, Number(product.current_price));
    }
    return true;
  } catch (err) {
    console.error("Error initializing price snapshot:", err);
    return false;
  }
};

export const checkPriceDrops = async (userId: string): Promise<number> => {
  let newAlertCount = 0;
  try {
    const { data: wishlist, error: wishlistError } = await supabase
      .from("wishlist_items")
      .select("*, products(*)")
      .eq("user_id", userId);

    if (wishlistError || !wishlist) return 0;

    for (const item of wishlist) {
      const product = item.products as Product;

      const history = await getProductPriceHistory(product.id);
      const snapshots = history.map((h) => ({
        price: Number(h.price),
        timestamp: h.timestamp,
      }));
      const recentSnapshots = filterByTimeWindow(snapshots, 48);
      const buffer = new CircularBuffer(10);
      recentSnapshots.forEach((h) => buffer.add(h));

      const currentPrice = Number(product.current_price);

      // If no snapshots, record current price as baseline
      if (snapshots.length === 0) {
        await recordPriceSnapshot(product.id, currentPrice);
        continue;
      }

      // If only one snapshot, don't calculate anomaly yet (need baseline)
      if (buffer.data.length < 2) {
        // Check if price changed from last recorded snapshot
        const lastSnapshot = snapshots[snapshots.length - 1];
        if (lastSnapshot.price !== currentPrice) {
          const priceDropPercent =
            ((lastSnapshot.price - currentPrice) / lastSnapshot.price) * 100;

          // Trigger alert for any price drop > 5%
          if (priceDropPercent > 5) {
            const { data: existing } = await supabase
              .from("alerts")
              .select("*")
              .eq("product_id", product.id)
              .eq("new_price", currentPrice)
              .eq("user_id", userId);

            if (!existing || existing.length === 0) {
              const { error: insertError } = await supabase
                .from("alerts")
                .insert({
                  user_id: userId,
                  product_id: product.id,
                  old_price: lastSnapshot.price,
                  new_price: currentPrice,
                  drop_percent: Math.round(priceDropPercent),
                });

              if (!insertError) {
                newAlertCount++;
              } else {
                console.error("Error inserting price drop alert:", insertError);
              }
            }
          }
          // Record the new price snapshot
          await recordPriceSnapshot(product.id, currentPrice);
        }
        continue;
      }

      // Use z-score anomaly detection with lowered threshold (1.0 instead of 1.5)
      const { isAnomaly, zScore } = calculateAnomaly(
        buffer.data,
        currentPrice,
        1.0, // LOWERED THRESHOLD for better sensitivity
      );

      if (isAnomaly) {
        const { data: existing, error: existingError } = await supabase
          .from("alerts")
          .select("*")
          .eq("product_id", product.id)
          .eq("new_price", currentPrice)
          .eq("user_id", userId);

        if (existingError) {
          console.error("Error checking existing alerts:", existingError);
          continue;
        }

        if (!existing || existing.length === 0) {
          const alertPayload = {
            user_id: userId,
            product_id: product.id,
            old_price:
              buffer.data[buffer.data.length - 1]?.price || currentPrice,
            new_price: currentPrice,
            drop_percent: Math.round(zScore * 10),
            z_score: zScore,
          };

          let insertError = null;

          const result = await supabase.from("alerts").insert(alertPayload);
          insertError = result.error;

          if (insertError && insertError.code === "PGRST204") {
            // Retry without z_score if the column is not available in the live schema.
            const { error: retryError } = await supabase.from("alerts").insert({
              user_id: userId,
              product_id: product.id,
              old_price: alertPayload.old_price,
              new_price: alertPayload.new_price,
              drop_percent: alertPayload.drop_percent,
            });
            insertError = retryError;
          }

          if (insertError) {
            console.error("Error inserting price drop alert:", insertError);
          } else {
            newAlertCount++;
          }
        }
      }

      // Record current price snapshot
      if (
        snapshots.length === 0 ||
        snapshots[snapshots.length - 1].price !== currentPrice
      ) {
        await recordPriceSnapshot(product.id, currentPrice);
      }
    }
  } catch (err) {
    console.error("Error checking price drops:", err);
  }
  return newAlertCount;
};
