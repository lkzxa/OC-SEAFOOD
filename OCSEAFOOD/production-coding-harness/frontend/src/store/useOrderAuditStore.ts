import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OrderAuditEntry {
  id: string;
  orderId: number;
  orderCode: string;
  changedFields: string[];
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
  note?: string | null;
  createdAt: string;
}

interface OrderAuditState {
  entries: OrderAuditEntry[];
  append: (entry: OrderAuditEntry) => void;
  clear: () => void;
}

export const useOrderAuditStore = create<OrderAuditState>()(
  persist(
    (set) => ({
      entries: [],
      append: (entry) =>
        set((state) => ({
          entries: [entry, ...state.entries],
        })),
      clear: () => set({ entries: [] }),
    }),
    {
      name: "ocseafood-order-audit",
      partialize: (state) => ({ entries: state.entries }),
    }
  )
);
