"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Book } from "@/content/books";
import { useCart } from "@/context/CartContext";

export default function BookPurchaseBox({ book }: { book: Book }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [format, setFormat] = useState(book.variants?.[0]?.format ?? "");
  const [added, setAdded] = useState(false);

  if (book.status !== "published" || !book.variants) {
    return (
      <p className="font-inter text-[12px] tracking-[0.1em] uppercase text-near-black/50">
        Purchase details will be available closer to release.
      </p>
    );
  }

  const handleAddToCart = () => {
    addItem(book.slug, format, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(book.slug, format, 1);
    router.push("/cart");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {book.variants.map((v) => (
          <button
            key={v.format}
            type="button"
            onClick={() => setFormat(v.format)}
            className={`font-inter text-[13px] px-4 py-2 border transition-colors duration-300 ${
              format === v.format
                ? "border-near-black bg-near-black text-ivory-100"
                : "border-near-black/20 text-near-black/80 hover:border-near-black/50"
            }`}
          >
            {v.format} — ₹{v.priceINR}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mt-6">
        <button
          type="button"
          onClick={handleBuyNow}
          className="font-inter text-[11px] tracking-[0.16em] uppercase px-8 py-3.5 bg-near-black text-ivory-100 hover:bg-bronze hover:text-near-black transition-colors duration-300"
        >
          Buy Now
        </button>
        <button
          type="button"
          onClick={handleAddToCart}
          className="font-inter text-[11px] tracking-[0.16em] uppercase px-8 py-3.5 border border-near-black text-near-black hover:bg-near-black hover:text-ivory-100 transition-colors duration-300"
        >
          {added ? "Added ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
