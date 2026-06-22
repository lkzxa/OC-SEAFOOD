import { useCartStore } from '../store/useCartStore';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Shopping Cart Store (Zustand)', () => {
  beforeEach(() => {
    // Clear cart store and localStorage before each test
    useCartStore.getState().clearCart();
    localStorage.clear();
  });

  it('should initialize with an empty cart', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.totalItems()).toBe(0);
    expect(state.subtotal()).toBe(0);
  });

  it('should add items and calculate total items & subtotal correctly', () => {
    const store = useCartStore.getState();
    
    // Add product 1
    store.addItem({
      id: 1,
      name: 'Bào ngư Hàn Quốc',
      priceReference: 120000,
      image: '/abalone.jpg',
      unit: 'con',
    }, 2);

    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().items[0]).toEqual({
      id: 1,
      name: 'Bào ngư Hàn Quốc',
      priceReference: 120000,
      image: '/abalone.jpg',
      unit: 'con',
      quantity: 2,
    });
    expect(useCartStore.getState().totalItems()).toBe(2);
    expect(useCartStore.getState().subtotal()).toBe(240000);

    // Add product 2
    useCartStore.getState().addItem({
      id: 2,
      name: 'Cua hoàng đế',
      priceReference: 3000000,
      image: '/kingcrab.jpg',
      unit: 'kg',
    }, 1);

    expect(useCartStore.getState().items.length).toBe(2);
    expect(useCartStore.getState().totalItems()).toBe(3);
    expect(useCartStore.getState().subtotal()).toBe(3240000);
  });

  it('should increment quantity when adding duplicate products', () => {
    const store = useCartStore.getState();
    const product = {
      id: 1,
      name: 'Bào ngư Hàn Quốc',
      priceReference: 120000,
      image: '/abalone.jpg',
      unit: 'con',
    };

    store.addItem(product, 2);
    useCartStore.getState().addItem(product, 3);

    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
    expect(useCartStore.getState().totalItems()).toBe(5);
    expect(useCartStore.getState().subtotal()).toBe(600000);
  });

  it('should remove items completely from cart', () => {
    const store = useCartStore.getState();
    
    store.addItem({
      id: 1,
      name: 'Bào ngư',
      priceReference: 120000,
      image: '/abalone.jpg',
      unit: 'con',
    }, 2);

    store.addItem({
      id: 2,
      name: 'Tôm hùm',
      priceReference: 800000,
      image: '/lobster.jpg',
      unit: 'con',
    }, 1);

    expect(useCartStore.getState().items.length).toBe(2);

    useCartStore.getState().removeItem(1);

    const updatedState = useCartStore.getState();
    expect(updatedState.items.length).toBe(1);
    expect(updatedState.items[0].id).toBe(2);
    expect(updatedState.totalItems()).toBe(1);
    expect(updatedState.subtotal()).toBe(800000);
  });

  it('should update item quantity and remove it if updated quantity is <= 0', () => {
    const store = useCartStore.getState();
    
    store.addItem({
      id: 1,
      name: 'Bào ngư',
      priceReference: 120000,
      image: '/abalone.jpg',
      unit: 'con',
    }, 2);

    // Update to 5
    useCartStore.getState().updateQuantity(1, 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
    expect(useCartStore.getState().totalItems()).toBe(5);

    // Update to 0 (should remove)
    useCartStore.getState().updateQuantity(1, 0);
    expect(useCartStore.getState().items.length).toBe(0);
    expect(useCartStore.getState().totalItems()).toBe(0);
  });

  it('should clear all items in the cart', () => {
    const store = useCartStore.getState();
    
    store.addItem({
      id: 1,
      name: 'Bào ngư',
      priceReference: 120000,
      image: '/abalone.jpg',
      unit: 'con',
    }, 2);

    store.addItem({
      id: 2,
      name: 'Tôm hùm',
      priceReference: 800000,
      image: '/lobster.jpg',
      unit: 'con',
    }, 1);

    expect(useCartStore.getState().items.length).toBe(2);

    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items.length).toBe(0);
    expect(useCartStore.getState().totalItems()).toBe(0);
    expect(useCartStore.getState().subtotal()).toBe(0);
  });
});
