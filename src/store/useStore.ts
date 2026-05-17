import { useState, useEffect } from 'react';
import { WishlistItem, Alert, Product, CartItemType } from '../types';
import { supabase } from '@/config/supabaseConfig';
import { User } from '@supabase/supabase-js';
import { 
  fetchWishlist, 
  fetchAlerts, 
  fetchCartItems,
  fetchProducts
} from '../services/supabaseService';

export interface AppState {
  user: User | null;
  wishlist: WishlistItem[];
  alerts: Alert[];
  unreadCount: number;
  cartItems: CartItemType[];
  cartCount: number; // Derived: sum of all quantities
  activeVoucherDiscount: number;
  useCoins: boolean;
  ordersCount: number;
  buyNowItem: CartItemType | null;
  followedStores: string[];
  pastOrders: { id: string; date: string; items: CartItemType[]; total: number; status: string }[];
  
  setUser: (user: User | null) => void;
  loadUserData: (uid: string) => Promise<void>;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  markAlertRead: (alertId: number) => Promise<void>;
  setTargetPrice: (productId: string, price: number) => Promise<void>;
  setWishlist: (items: WishlistItem[]) => void;
  setAlerts: (alerts: Alert[]) => void;

  // Cart Actions
  addToCart: (item: CartItemType) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateCartQuantity: (id: string, quantity: number) => Promise<void>;
  toggleCartItem: (id: string) => void;
  toggleSellerItems: (seller: string, isChecked: boolean) => void;
  setVoucherDiscount: (amount: number) => void;
  setUseCoins: (use: boolean) => void;
  setBuyNowItem: (item: CartItemType | null) => void;
  placeOrder: (items: CartItemType[], total: number) => Promise<void>;
  toggleFollowStore: (storeName: string) => void;
}

const calculateCartCount = (items: CartItemType[]) => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

const notifyListeners = () => {
  Promise.resolve().then(() => listeners.forEach((listener) => listener(state)));
};

let state: AppState = {
  user: null,
  wishlist: [],
  alerts: [],
  unreadCount: 0,
  cartItems: [],
  cartCount: 0,
  activeVoucherDiscount: 0,
  useCoins: false,
  ordersCount: 0,
  buyNowItem: null,
  followedStores: [],
  pastOrders: [],
  
  setUser: async (user) => {
    state.user = user;
    if (user) {
      await state.loadUserData(user.id);
    } else {
      state.wishlist = [];
      state.cartItems = [];
      state.pastOrders = [];
      state.ordersCount = 0;
      state.cartCount = 0;
      state.alerts = [];
      state.unreadCount = 0;
    }
    notifyListeners();
  },

  loadUserData: async (uid: string) => {
    try {
      const [wishlist, alerts, cartItems, { data: orders }] = await Promise.all([
        fetchWishlist(uid),
        fetchAlerts(uid),
        fetchCartItems(uid),
        supabase.from('orders').select('*').eq('user_id', uid).order('created_at', { ascending: false })
      ]);

      state.wishlist = wishlist;
      state.alerts = alerts;
      state.unreadCount = alerts.filter(a => !a.is_read).length;
      state.cartItems = cartItems;
      state.cartCount = calculateCartCount(cartItems);
      state.pastOrders = (orders || []).map(o => ({
        id: o.id,
        date: o.created_at,
        items: o.items,
        total: o.total,
        status: o.status
      }));
      state.ordersCount = state.pastOrders.length;
      notifyListeners();
    } catch (e) {
      console.error('Failed to load user data', e);
    }
  },

  addToWishlist: async (product) => {
    if (!product || !product.id || !state.user) return;
    
    const { error } = await supabase
      .from('wishlist_items')
      .insert({
        user_id: state.user.id,
        product_id: product.id,
        target_price: product.current_price
      });

    if (!error) {
      state.wishlist = [...state.wishlist, { product_id: product.id, added_at: new Date().toISOString(), target_price: product.current_price, product }];
      notifyListeners();
    }
  },
  removeFromWishlist: async (productId) => {
    if (!state.user) return;
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', state.user.id)
      .eq('product_id', productId);

    if (!error) {
      state.wishlist = state.wishlist.filter(w => w.product_id !== productId);
      notifyListeners();
    }
  },
  markAlertRead: async (alertId) => {
    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    if (!error) {
      state.alerts = state.alerts.map(a => a.id === alertId ? { ...a, is_read: true } : a);
      state.unreadCount = state.alerts.filter(a => !a.is_read).length;
      notifyListeners();
    }
  },
  setTargetPrice: async (productId, price) => {
    if (!state.user) return;
    const { error } = await supabase
      .from('wishlist_items')
      .update({ target_price: price })
      .eq('user_id', state.user.id)
      .eq('product_id', productId);

    if (!error) {
      state.wishlist = state.wishlist.map(w => w.product_id === productId ? { ...w, target_price: price } : w);
      notifyListeners();
    }
  },
  setWishlist: (items) => {
    state.wishlist = items;
    notifyListeners();
  },
  setAlerts: (alerts) => {
    state.alerts = alerts;
    state.unreadCount = alerts.filter(a => !a.is_read).length;
    notifyListeners();
  },
  
  addToCart: async (item: CartItemType) => {
    if (!item || !item.product || !state.user) return;

    const existingIndex = state.cartItems.findIndex(i => i.product.id === item.product.id && i.variant === item.variant);
    
    if (existingIndex >= 0) {
      const updatedQuantity = state.cartItems[existingIndex].quantity + item.quantity;
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: updatedQuantity })
        .eq('id', state.cartItems[existingIndex].id);

      if (!error) {
        let newItems = [...state.cartItems];
        newItems[existingIndex].quantity = updatedQuantity;
        state.cartItems = newItems;
      }
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: state.user.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price_at_add: item.priceAtAdd,
          variant: item.variant,
          is_checked: true
        })
        .select()
        .single();

      if (!error && data) {
        state.cartItems = [...state.cartItems, { ...item, id: data.id }];
      }
    }
    
    state.cartCount = calculateCartCount(state.cartItems);
    notifyListeners();
  },
  removeFromCart: async (id: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);

    if (!error) {
      state.cartItems = state.cartItems.filter(i => i.id !== id);
      state.cartCount = calculateCartCount(state.cartItems);
      notifyListeners();
    }
  },
  updateCartQuantity: async (id: string, quantity: number) => {
    if (quantity < 1) {
      await state.removeFromCart(id);
    } else {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id);

      if (!error) {
        state.cartItems = state.cartItems.map(i => i.id === id ? { ...i, quantity } : i);
        state.cartCount = calculateCartCount(state.cartItems);
        notifyListeners();
      }
    }
  },
  toggleCartItem: (id: string) => {
    state.cartItems = state.cartItems.map(i => i.id === id ? { ...i, isChecked: !i.isChecked } : i);
    notifyListeners();
  },
  toggleSellerItems: (seller: string, isChecked: boolean) => {
    state.cartItems = state.cartItems.map(i => i.product.seller === seller ? { ...i, isChecked } : i);
    notifyListeners();
  },
  setVoucherDiscount: (amount: number) => {
    state.activeVoucherDiscount = amount;
    notifyListeners();
  },
  setUseCoins: (use: boolean) => {
    state.useCoins = use;
    notifyListeners();
  },
  setBuyNowItem: (item: CartItemType | null) => {
    state.buyNowItem = item;
    notifyListeners();
  },
  placeOrder: async (items, total) => {
    if (!state.user) return;
    const orderId = `WL-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const { error } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: state.user.id,
        items: items,
        total: total,
        status: 'To Ship'
      });

    if (!error) {
      const newOrder = {
        id: orderId,
        date: new Date().toISOString(),
        items: [...items],
        total,
        status: 'To Ship'
      };
      
      state.pastOrders = [newOrder, ...state.pastOrders];
      state.ordersCount = state.pastOrders.length;
      
      // If these items came from the cart, remove them from Supabase
      const itemIds = items.map(i => i.id).filter(id => state.cartItems.some(ci => ci.id === id));
      if (itemIds.length > 0) {
        await supabase.from('cart_items').delete().in('id', itemIds);
        state.cartItems = state.cartItems.filter(i => !itemIds.includes(i.id));
        state.cartCount = calculateCartCount(state.cartItems);
      }
      
      state.buyNowItem = null;
      notifyListeners();
    }
  },
  toggleFollowStore: (storeName: string) => {
    if (state.followedStores.includes(storeName)) {
      state.followedStores = state.followedStores.filter(s => s !== storeName);
    } else {
      state.followedStores = [...state.followedStores, storeName];
    }
    notifyListeners();
  }
};

const listeners = new Set<(s: AppState) => void>();

export const useStore = <T>(selector: (state: AppState) => T): T => {
  const [selectedState, setSelectedState] = useState(() => selector(state));

  useEffect(() => {
    const listener = (newState: AppState) => {
      setSelectedState(() => selector(newState));
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return selectedState;
};
