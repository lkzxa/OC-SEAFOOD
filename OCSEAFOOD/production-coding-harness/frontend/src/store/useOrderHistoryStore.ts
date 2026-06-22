import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OrderHistoryItem {
  productId: number;
  name: string;
  unit: string;
  quantity: number;
  priceReference: number;
  image: string;
}

export interface OrderHistoryEntry {
  id: number;
  code: string;
  userId: number | null;
  email: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  note?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  totalFinal: number;
  totalItems: number;
  items: OrderHistoryItem[];
  createdAt: string;
}

interface OrderHistoryState {
  orders: OrderHistoryEntry[];
  addOrder: (order: OrderHistoryEntry) => void;
  clearOrders: () => void;
}

export const useOrderHistoryStore = create<OrderHistoryState>()(
  persist(
    (set) => ({
      orders: [],

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      clearOrders: () => set({ orders: [] }),
    }),
    {
      name: "ocseafood-order-history",
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);
