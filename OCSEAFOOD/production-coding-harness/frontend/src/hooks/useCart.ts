import { useCartStore, CartItem } from '@/store/useCartStore';
import { useHasMounted } from '@/hooks/useHasMounted';

export function useCart() {
  const mounted = useHasMounted();
  const store = useCartStore();

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
