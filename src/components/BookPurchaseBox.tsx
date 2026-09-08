"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookRecord } from "@/lib/booksRepo";
import { useCart } from "@/context/CartContext";
import NotifyMeForm from "@/components/NotifyMeForm";

export default function BookPurchaseBox({ book }: { book: BookRecord }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [format, setFormat] = useState(book.variants[0]?.format ?? "");
  const [signed, setSigned] = useState(false);
  const [personalise, setPersonalise] = useState(false);
  const [message, setMessage] = useState("");
  const [spellingConfirmed, setSpellingConfirmed] = useState(false);
  const [added, setAdded] = useState(false);

  if (book.status === "COMING_SOON" || book.status === "PRE_ORDER") {
    return (
      <div>
        <span className="inline-block font-inter text-[11px] tracking-[0.16em] uppercase px-5 py-2 border border-bronze text-bronze">
          {book.status === "PRE_ORDER" ? "Pre-Order" : "Coming Soon"}
        </span>
        <NotifyMeForm bookId={book.id} />
      </div>
    );
  }

  if (book.status === "OUT_OF_STOCK") {
    return (
      <div>
        <span className="inline-block font-inter text-[11px] tracking-[0.16em] uppercase px-5 py-2 border border-near-black/30 text-near-black/60">
          Out of Stock
        </span>
        <NotifyMeForm bookId={book.id} />
      </div>
    );
  }

  if (book.status !== "PUBLISHED" || book.variants.length === 0) {
    return (
      <p className="font-inter text-[12px] tracking-[0.1em] uppercase text-near-black/50">
        Purchase details will be available closer to release.
      </p>
    );
  }

  const selectedVariant = book.variants.find((v) => v.format === format) || book.variants[0];
  const outOfStock = selectedVariant.stock <= 0;
  const canAdd = !outOfStock && (!personalise || (message.trim().length > 0 && spellingConfirmed));

  const buildLine = () => ({
    bookSlug: book.slug,
    format: selectedVariant.format,
    title: book.title,
    cover: book.cover,
    priceINR: selectedVariant.priceINR,
    signed,
    personalisationMessage: personalise ? message.trim() : undefined,
  });

  const handleAddToCart = () => {
    if (!canAdd) return;
    addItem(buildLine());
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!canAdd) return;
    addItem(buildLine());
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
            {v.stock <= 0 && " (Out of Stock)"}
          </button>
        ))}
      </div>

      {book.signedCopyAvailable && (
        <label className="flex items-center gap-2 font-inter text-[13px] text-near-black/80 mt-5">
          <input type="checkbox" checked={signed} onChange={(e) => setSigned(e.target.checked)} className="accent-bronze" />
          Add a signed copy
        </label>
      )}

      {book.personalisationAvailable && (
        <div className="mt-4">
          <label className="flex items-center gap-2 font-inter text-[13px] text-near-black/80">
            <input type="checkbox" checked={personalise} onChange={(e) => setPersonalise(e.target.checked)} className="accent-bronze" />
            Add a personalised message
          </label>
          {personalise && (
            <div className="mt-3 max-w-md">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, book.personalisationCharLimit))}
                rows={3}
                placeholder="Your message for the inscription"
                className="w-full border border-near-black/20 focus:border-bronze px-3 py-2 font-inter text-[13px] text-near-black outline-none transition-colors"
              />
              <p className="font-inter text-[11px] text-near-black/40 mt-1">
                {message.length}/{book.personalisationCharLimit} characters
              </p>
              <label className="flex items-start gap-2 font-inter text-[12px] text-near-black/70 mt-2">
                <input
                  type="checkbox"
                  checked={spellingConfirmed}
                  onChange={(e) => setSpellingConfirmed(e.target.checked)}
                  className="mt-0.5 accent-bronze"
                />
                I&apos;ve checked the spelling of my personalisation message — it will be printed exactly as written.
              </label>
            </div>
          )}
        </div>
      )}

      {outOfStock && <p className="font-inter text-[12px] text-red-600 mt-4">This format is currently out of stock.</p>}

      <div className="flex flex-wrap gap-4 mt-6">
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!canAdd}
          className="font-inter text-[11px] tracking-[0.16em] uppercase px-8 py-3.5 bg-near-black text-ivory-100 hover:bg-bronze hover:text-near-black transition-colors duration-300 disabled:opacity-40 disabled:pointer-events-none"
        >
          Buy Now
        </button>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAdd}
          className="font-inter text-[11px] tracking-[0.16em] uppercase px-8 py-3.5 border border-near-black text-near-black hover:bg-near-black hover:text-ivory-100 transition-colors duration-300 disabled:opacity-40 disabled:pointer-events-none"
        >
          {added ? "Added ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
