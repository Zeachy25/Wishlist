import { supabase } from '../../config/supabaseConfig';
import { Product, Alert, WishlistItem, CartItemType } from '../types';

export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data || [];
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }

  return data;
};

export const fetchAlerts = async (userId: string): Promise<Alert[]> => {
  const { data, error } = await supabase
    .from('alerts')
    .select('*, products(*)')
    .eq('user_id', userId)
    .order('triggered_at', { ascending: false });

  if (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }

  return data || [];
};

export const fetchWishlist = async (userId: string): Promise<WishlistItem[]> => {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*, products(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }

  return data || [];
};

export const fetchCartItems = async (userId: string): Promise<CartItemType[]> => {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }

  // Map Supabase data to CartItemType
  return (data || []).map(item => ({
    id: item.id,
    product: item.products,
    quantity: item.quantity,
    isChecked: item.is_checked,
    priceAtAdd: item.price_at_add,
    currentPrice: item.products.current_price,
    variant: item.variant
  }));
};

export const searchProducts = async (query: string, pageNum: number, pageSize: number): Promise<{ data: Product[], totalCount: number }> => {
  let supabaseQuery = supabase
    .from('products')
    .select('*', { count: 'exact' });

  if (query) {
    supabaseQuery = supabaseQuery.ilike('name', `%${query}%`);
  }

  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabaseQuery
    .range(from, to)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error searching products:', error);
    return { data: [], totalCount: 0 };
  }

  return { 
    data: data || [], 
    totalCount: count || 0 
  };
};

export const getProductPriceHistory = async (productId: string) => {
  const { data, error } = await supabase
    .from('price_snapshots')
    .select('*')
    .eq('product_id', productId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching price history:', error);
    return [];
  }

  return data || [];
};
