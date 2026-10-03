'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type CartItem = {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string | null;
  price: number;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  ready: boolean;
  count: number;
  total: number;
  add: (item: Omit<CartItem, 'qty'>) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);
const KEY = 'garage-said-cart';
export const MAX_QTY = 10;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, 'qty'>) => {
    setItems((list) => {
      const found = list.find((i) => i.id === item.id);
      if (found) {
        return list.map((i) =>
          i.id === item.id ? { ...i, qty: Math.min(MAX_QTY, i.qty + 1) } : i
        );
      }
      return [...list, { ...item, qty: 1 }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((list) =>
      list.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : i
      )
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((list) => list.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.qty, 0),
      total: items.reduce((n, i) => n + i.qty * i.price, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [items, ready, add, setQty, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans CartProvider');
  return ctx;
}