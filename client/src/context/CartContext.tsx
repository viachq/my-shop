import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type { Product } from '../data/products';

export interface CartItem {
  product: Product;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productName: string) => void;
  updateQty: (productName: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  promoCode: string;
  setPromoCode: (code: string) => void;
  promoDiscount: number;
  setPromoDiscount: (discount: number) => void;
  promoApplied: boolean;
  setPromoApplied: (applied: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem('cartItems');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.name === product.name);
      if (existing) {
        return prev.map(item =>
          item.product.name === product.name
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productName: string) => {
    setItems(prev => prev.filter(item => item.product.name !== productName));
  }, []);

  const updateQty = useCallback((productName: string, qty: number) => {
    if (qty < 1) return;
    setItems(prev =>
      prev.map(item =>
        item.product.name === productName
          ? { ...item, qty }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCode('');
    setPromoDiscount(0);
    setPromoApplied(false);
  }, []);

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  );

  const cartTotal = useMemo(
    () => items.reduce((sum, item) => sum + parseFloat(item.product.price) * item.qty, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal,
      promoCode, setPromoCode, promoDiscount, setPromoDiscount, promoApplied, setPromoApplied,
    }),
    [items, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal,
     promoCode, promoDiscount, promoApplied]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
