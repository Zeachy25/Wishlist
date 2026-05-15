import { useState, useEffect } from 'react';
import { WishlistItem, Alert, Product, CartItemType } from '../types';
import { mockAlerts } from '../services/mockData';
import { User } from 'firebase/auth';
import { db } from '@/config/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  saveUserData: (uid: string) => Promise<void>;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  markAlertRead: (alertId: number) => void;
  setTargetPrice: (productId: string, price: number) => void;
  setWishlist: (items: WishlistItem[]) => void;
  setAlerts: (alerts: Alert[]) => void;

  // Cart Actions
  addToCart: (item: CartItemType) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  toggleCartItem: (id: string) => void;
  toggleSellerItems: (seller: string, isChecked: boolean) => void;
  setVoucherDiscount: (amount: number) => void;
  setUseCoins: (use: boolean) => void;
  setBuyNowItem: (item: CartItemType | null) => void;
  placeOrder: (items: CartItemType[], total: number) => void;
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
  alerts: mockAlerts,
  unreadCount: mockAlerts.filter(a => !a.is_read).length,
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
      await state.loadUserData(user.uid);
    } else {
      state.wishlist = [];
      state.cartItems = [];
      state.pastOrders = [];
      state.ordersCount = 0;
      state.cartCount = 0;
    }
    notifyListeners();
  },

  loadUserData: async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        state.wishlist = data.wishlist || [];
        state.cartItems = data.cartItems || [];
        state.pastOrders = data.pastOrders || [];
        state.cartCount = calculateCartCount(state.cartItems);
        state.ordersCount = state.pastOrders.length;
        notifyListeners();
      }
    } catch (e) {
      console.error('Failed to load user data', e);
    }
  },

  saveUserData: async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, {
        wishlist: state.wishlist,
        cartItems: state.cartItems,
        pastOrders: state.pastOrders,
      }, { merge: true });
    } catch (e) {
      console.error('Failed to save user data', e);
    }
  },

  addToWishlist: (product) => {
    if (!product || !product.id) return;
    state.wishlist = [...state.wishlist, { product_id: product.id, added_at: new Date().toISOString(), target_price: product.current_price, product }];
    if (state.user) state.saveUserData(state.user.uid);
    notifyListeners();
  },
  removeFromWishlist: (productId) => {
    state.wishlist = state.wishlist.filter(w => w.product_id !== productId);
    if (state.user) state.saveUserData(state.user.uid);
    notifyListeners();
  },
  markAlertRead: (alertId) => {
    state.alerts = state.alerts.map(a => a.id === alertId ? { ...a, is_read: true } : a);
    state.unreadCount = state.alerts.filter(a => !a.is_read).length;
    notifyListeners();
  },
  setTargetPrice: (productId, price) => {
    state.wishlist = state.wishlist.map(w => w.product_id === productId ? { ...w, target_price: price } : w);
    if (state.user) state.saveUserData(state.user.uid);
    notifyListeners();
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
  
  addToCart: (item: CartItemType) => {
    if (!item || !item.id || !item.product) {
      console.warn('addToCart called with invalid item:', item);
      return;
    }

    const existingIndex = state.cartItems.findIndex(i => i.id === item.id);
    let newItems = [...state.cartItems];
    
    if (existingIndex >= 0) {
      newItems[existingIndex].quantity += item.quantity;
      newItems[existingIndex].currentPrice = item.currentPrice;
    } else {
      newItems.push(item);
    }
    
    state.cartItems = newItems;
    state.cartCount = calculateCartCount(newItems);
    if (state.user) state.saveUserData(state.user.uid);
    notifyListeners();
  },
  removeFromCart: (id: string) => {
    state.cartItems = state.cartItems.filter(i => i.id !== id);
    state.cartCount = calculateCartCount(state.cartItems);
    if (state.user) state.saveUserData(state.user.uid);
    notifyListeners();
  },
  updateCartQuantity: (id: string, quantity: number) => {
    if (quantity < 1) {
      state.cartItems = state.cartItems.filter(i => i.id !== id);
    } else {
      state.cartItems = state.cartItems.map(i => i.id === id ? { ...i, quantity } : i);
    }
    state.cartCount = calculateCartCount(state.cartItems);
    if (state.user) state.saveUserData(state.user.uid);
    notifyListeners();
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
  placeOrder: (items, total) => {
    const orderId = `WL-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      id: orderId,
      date: new Date().toISOString(),
      items: [...items],
      total,
      status: 'To Ship'
    };
    
    state.pastOrders = [newOrder, ...state.pastOrders];
    state.ordersCount = state.pastOrders.length;
    
    // If these items came from the cart, remove them
    const itemIds = new Set(items.map(i => i.id));
    state.cartItems = state.cartItems.filter(i => !itemIds.has(i.id));
    state.cartCount = calculateCartCount(state.cartItems);
    
    state.buyNowItem = null;
    if (state.user) state.saveUserData(state.user.uid);
    notifyListeners();
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
