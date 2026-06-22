import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  priceReference: number;
  quantity: number;
  image: string;
  unit: string;
  selectedWeight?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeItem: (productId: number, selectedWeight?: string) => void;
  updateQuantity: (productId: number, quantity: number, selectedWeight?: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.id === product.id && item.selectedWeight === product.selectedWeight
          );
          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + quantity
            };
            return { items: updatedItems };
          }
          return { items: [...state.items, { ...product, quantity }] };
        });
      },

      removeItem: (productId, selectedWeight) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === productId && item.selectedWeight === selectedWeight)
          )
        }));
      },

      updateQuantity: (productId, quantity, selectedWeight) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) => !(item.id === productId && item.selectedWeight === selectedWeight)
              )
            };
          }
          return {
            items: state.items.map((item) =>
              (item.id === productId && item.selectedWeight === selectedWeight)
                ? { ...item, quantity }
                : item
            )
          };
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      subtotal: () => {
        return get().items.reduce((sum, item) => sum + item.quantity * item.priceReference, 0);
      }
    }),
    {
      name: 'ocseafood-cart',
      // Only persist the items array to localStorage, functions are ignored by default
      partialize: (state) => ({ items: state.items })
    }
  )
);
