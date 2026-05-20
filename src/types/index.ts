export interface Product {
  id: string;
  name: string;
  image_url: string;
  images?: string[];
  category: string;
  current_price: number;
  original_price: number;
  rating: number;
  review_count: number;
  sold_count?: number;
  seller: string;
  description: string;
  discount_percent?: number;
  variants?: {
    color?: string[];
    storage?: string[];
  };
  variantPrices?: Record<string, number>;
}

export interface Alert {
  id: number;
  product_id: string;
  old_price: number;
  new_price: number;
  drop_percent: number;
  z_score?: number;
  triggered_at: string;
  is_read: boolean;
  product?: Product;
}

export interface WishlistItem {
  product_id: string;
  added_at: string;
  target_price: number;
  product?: Product;
}

export interface PriceSnapshot {
  id: number;
  product_id: string;
  price: number;
  timestamp: string;
  buffer_index?: number;
}

export interface CartItemType {
  id: string; // unique id combining product id and variants
  product: Product;
  quantity: number;
  isChecked: boolean;
  priceAtAdd: number;
  currentPrice: number;
  variant?: string; // e.g., "Color: Black, Storage: Standard"
}
