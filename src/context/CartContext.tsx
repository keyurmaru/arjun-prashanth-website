"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartLine {
  bookSlug: string;
  format: string;
  quantity: number;
  title: string;
  cover: string;
  priceINR: number;
  signed: boolean;
  personalisationMessage?: string;
}

interface CartContextValue {
  lines: CartLine[];
  totalItems: number;
  subtotalINR: number;
  addItem: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "apr-cart";

function sameLine(a: CartLine, b: Omit<CartLine, "quantity">): boolean {
  return (
    a.bookSlug === b.bookSlug &&
    a.format === b.format &&
    a.signed === b.signed &&
    (a.personalisationMessage || "") === (b.personalisationMessage || "")
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Cart starts empty during SSR/hydration so the server and initial
    // client render match; this effect then syncs in the persisted value
    // from localStorage — an external store React can't read during render.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing initial state from an external store (localStorage), not derivable during render
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // Ignore corrupt/blocked storage — cart just starts empty.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage unavailable (private mode, quota) — cart still works for
      // this page load, just won't persist across a reload.
    }
  }, [lines, hydrated]);

  const addItem: CartContextValue["addItem"] = (line) => {
    const quantity = line.quantity ?? 1;
    setLines((prev) => {
      const existingIndex = prev.findIndex((l) => sameLine(l, line));
      if (existingIndex >= 0) {
        return prev.map((l, i) => (i === existingIndex ? { ...l, quantity: l.quantity + quantity } : l));
      }
      return [...prev, { ...line, quantity }];
    });
  };

  const removeItem = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return removeItem(index);
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, quantity } : l)));
  };

  const clear = () => setLines([]);

  const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotalINR = lines.reduce((sum, l) => sum + l.priceINR * l.quantity, 0);

  return (
    <CartContext.Provider value={{ lines, totalItems, subtotalINR, addItem, removeItem, updateQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
