"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CartPageClient() {
  const { lines, updateQuantity, removeItem, subtotalINR } = useCart();

  if (lines.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-inter text-[15px] text-near-black/70">Your cart is empty.</p>
        <Link
          href="/books"
          className="inline-block mt-6 font-inter text-[11px] tracking-[0.16em] uppercase px-8 py-3.5 bg-near-black text-ivory-100 hover:bg-bronze hover:text-near-black transition-colors duration-300"
        >
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-14">
      <div className="flex flex-col gap-6">
        {lines.map((line, index) => (
          <div key={index} className="flex gap-5 border-b border-near-black/10 pb-6">
            <div className="relative w-20 aspect-[2/3] shrink-0">
              <Image src={line.cover} alt={line.title} fill sizes="80px" className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-cormorant font-medium text-near-black text-lg">{line.title}</p>
              <p className="font-inter text-[12px] text-near-black/60 mt-1">{line.format}</p>
              {line.signed && <p className="font-inter text-[11px] text-bronze mt-0.5">Signed Copy</p>}
              {line.personalisationMessage && (
                <p className="font-inter text-[11px] text-near-black/50 mt-0.5">
                  Personalisation: &quot;{line.personalisationMessage}&quot;
                </p>
              )}
              <p className="font-inter text-[13px] text-near-black/80 mt-2">₹{line.priceINR}</p>

              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center border border-near-black/20">
                  <button
                    type="button"
                    onClick={() => updateQuantity(index, line.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-near-black hover:bg-near-black/5"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-inter text-[13px]">{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(index, line.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-near-black hover:bg-near-black/5"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="font-inter text-[11px] tracking-[0.1em] uppercase text-near-black/50 hover:text-near-black"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-near-black/10 p-6 h-fit">
        <p className="font-inter text-[11px] tracking-[0.16em] uppercase text-near-black/60 mb-4">Order Summary</p>
        <div className="flex justify-between font-inter text-[14px] text-near-black/80 mb-2">
          <span>Subtotal</span>
          <span>₹{subtotalINR}</span>
        </div>
        <p className="font-inter text-[12px] text-near-black/50 mb-6">Shipping calculated at checkout.</p>
        <Link
          href="/checkout"
          className="block text-center font-inter text-[11px] tracking-[0.16em] uppercase px-8 py-3.5 bg-near-black text-ivory-100 hover:bg-bronze hover:text-near-black transition-colors duration-300"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
