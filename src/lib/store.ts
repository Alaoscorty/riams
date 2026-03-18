
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language } from './translations';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CustomerSession {
  name: string;
  phone: string;
  id?: string;
}

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  deliveryZone: string;
  setDeliveryZone: (zone: string) => void;
  isAuthenticated: boolean; // Admin auth
  customerSession: CustomerSession | null;
  setCustomerSession: (session: CustomerSession | null) => void;
  login: (code: string) => boolean;
  logout: () => void;
}

const DELIVERY_FEES: Record<string, number> = {
  'Dowa': 500,
  'Djassin': 1000,
  'Ouando': 1000,
  'Default': 1000
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'fr',
      setLanguage: (lang) => set({ language: lang }),
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      cart: [],
      addToCart: (item) => set((state) => {
        const existing = state.cart.find((i) => i.id === item.id);
        if (existing) {
          return {
            cart: state.cart.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return { cart: [...state.cart, { ...item, quantity: 1 }] };
      }),
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((i) => i.id !== id),
      })),
      updateQuantity: (id, delta) => set((state) => ({
        cart: state.cart.map((i) =>
          i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
        ),
      })),
      clearCart: () => set({ cart: [] }),
      deliveryZone: 'Dowa',
      setDeliveryZone: (zone) => set({ deliveryZone: zone }),
      isAuthenticated: false,
      customerSession: null,
      setCustomerSession: (session) => set({ customerSession: session }),
      login: (code) => {
        if (code === "RIAMS716") {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false, customerSession: null }),
    }),
    {
      name: 'riams-lounge-store-v3',
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
        cart: state.cart,
        deliveryZone: state.deliveryZone,
        isAuthenticated: state.isAuthenticated,
        customerSession: state.customerSession
      })
    }
  )
);

export const getDeliveryFee = (zone: string) => DELIVERY_FEES[zone] || DELIVERY_FEES['Default'];
