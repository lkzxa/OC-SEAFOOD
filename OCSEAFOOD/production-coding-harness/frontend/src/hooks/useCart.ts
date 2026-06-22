import { useEffect, useState } from 'react';
import { useCartStore, CartItem } from '@/store/useCartStore';

export function useCart() {
  const [mounted, setMounted] = useState(false);
  const store = useCartStore();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return {
    items: mounted ? store.items : [],
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    totalItems: mounted ? store.totalItems() : 0,
    subtotal: mounted ? store.subtotal() : 0,
    isHydrated: mounted,
  };
}
export type { CartItem };
