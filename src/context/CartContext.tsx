"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getBookBySlug } from "@/content/books";

export interface CartLine {
  bookSlug: string;
  format: string;
  quantity: number;
}

export interface CartLineDisplay extends CartLine {
  title: string;
  cover: string;
  priceINR: number;
}

interface CartContextValue {
  lines: CartLine[];
  displayLines: CartLineDisplay[];
  totalItems: number;
  subtotalINR: number;
  addItem: (bookSlug: string, format: string, quantity?: number) => void;
  removeItem: (bookSlug: string, format: string) => void;
  updateQuantity: (bookSlug: string, format: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "apr-cart";

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

  const addItem = (bookSlug: string, format: string, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.bookSlug === bookSlug && l.format === format);
      if (existing) {
        return prev.map((l) =>
          l.bookSlug === bookSlug && l.format === format ? { ...l, quantity: l.quantity + quantity } : l,
        );
      }
      return [...prev, { bookSlug, format, quantity }];
    });
  };

  const removeItem = (bookSlug: string, format: string) => {
    setLines((prev) => prev.filter((l) => !(l.bookSlug === bookSlug && l.format === format)));
  };

  const updateQuantity = (bookSlug: string, format: string, quantity: number) => {
    if (quantity < 1) return removeItem(bookSlug, format);
    setLines((prev) =>
      prev.map((l) => (l.bookSlug === bookSlug && l.format === format ? { ...l, quantity } : l)),
    );
  };

  const clear = () => setLines([]);

  const displayLines: CartLineDisplay[] = useMemo(
    () =>
      lines
        .map((line) => {
          const book = getBookBySlug(line.bookSlug);
          const variant = book?.variants?.find((v) => v.format === line.format);
          if (!book || !variant) return null;
          return { ...line, title: book.title, cover: book.cover, priceINR: variant.priceINR };
        })
        .filter((l): l is CartLineDisplay => l !== null),
    [lines],
  );

  const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotalINR = displayLines.reduce((sum, l) => sum + l.priceINR * l.quantity, 0);

  return (
    <CartContext.Provider
      value={{ lines, displayLines, totalItems, subtotalINR, addItem, removeItem, updateQuantity, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
