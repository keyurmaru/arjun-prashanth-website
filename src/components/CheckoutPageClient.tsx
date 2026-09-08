"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { useCart } from "@/context/CartContext";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const SHIPPING_INR = 60;

export default function CheckoutPageClient() {
  const router = useRouter();
  const { lines, subtotalINR, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!scriptReady || typeof window.Razorpay === "undefined") {
      setError("Payment is still loading — please try again in a moment.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const address = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      line1: String(formData.get("line1") || ""),
      line2: String(formData.get("line2") || ""),
      city: String(formData.get("city") || ""),
      state: String(formData.get("state") || ""),
      pincode: String(formData.get("pincode") || ""),
      country: "India",
    };

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...address, items: lines }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not start payment. Please try again.");
        setSubmitting(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amountPaise,
        currency: "INR",
        name: "Arjun Prashanth",
        description: "Book order",
        order_id: data.razorpayOrderId,
        prefill: { name: address.name, email: address.email, contact: address.phone },
        theme: { color: "#B58A62" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.ok) {
              clear();
              router.push(`/order/${verifyData.orderId}`);
            } else {
              setError("Payment received but could not be confirmed. Please contact us with your payment ID.");
              setSubmitting(false);
            }
          } catch {
            setError("Payment received but could not be confirmed. Please contact us with your payment ID.");
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });
      razorpay.open();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  const totalINR = subtotalINR + SHIPPING_INR;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setScriptReady(true)} />
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_340px] gap-14">
        <div className="space-y-6">
          <p className="font-inter text-[11px] tracking-[0.16em] uppercase text-near-black/60">Shipping Address</p>
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Full Name *" name="name" required autoComplete="name" />
            <Field label="Email *" name="email" type="email" required autoComplete="email" />
          </div>
          <Field label="Phone *" name="phone" type="tel" required autoComplete="tel" />
          <Field label="Address Line 1 *" name="line1" required autoComplete="address-line1" />
          <Field label="Address Line 2" name="line2" autoComplete="address-line2" />
          <div className="grid sm:grid-cols-3 gap-6">
            <Field label="City *" name="city" required autoComplete="address-level2" />
            <Field label="State *" name="state" required autoComplete="address-level1" />
            <Field label="PIN Code *" name="pincode" required autoComplete="postal-code" pattern="[1-9][0-9]{5}" />
          </div>
          <p className="font-inter text-[12px] text-near-black/50">We currently ship within India only.</p>

          {error && (
            <p role="alert" className="font-inter text-[13px] text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="border border-near-black/10 p-6 h-fit">
          <p className="font-inter text-[11px] tracking-[0.16em] uppercase text-near-black/60 mb-4">Order Summary</p>
          <div className="space-y-2 mb-4">
            {lines.map((line, i) => (
              <div key={i} className="flex justify-between font-inter text-[13px] text-near-black/80">
                <span>
                  {line.title} ({line.format}){line.signed ? ", Signed" : ""} x{line.quantity}
                </span>
                <span>₹{line.priceINR * line.quantity}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-inter text-[13px] text-near-black/70 pt-3 border-t border-near-black/10">
            <span>Subtotal</span>
            <span>₹{subtotalINR}</span>
          </div>
          <div className="flex justify-between font-inter text-[13px] text-near-black/70 mt-1">
            <span>Shipping</span>
            <span>₹{SHIPPING_INR}</span>
          </div>
          <div className="flex justify-between font-inter text-[15px] text-near-black font-medium mt-3 pt-3 border-t border-near-black/10">
            <span>Total</span>
            <span>₹{totalINR}</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 font-inter text-[11px] tracking-[0.16em] uppercase px-8 py-3.5 bg-near-black text-ivory-100 hover:bg-bronze hover:text-near-black transition-colors duration-300 disabled:opacity-60"
          >
            {submitting ? "Processing…" : `Pay ₹${totalINR}`}
          </button>
        </div>
      </form>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  pattern,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  pattern?: string;
}) {
  return (
    <div>
      <label className="block font-inter text-[11px] tracking-[0.1em] uppercase text-near-black/60 mb-2" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        pattern={pattern}
        className="w-full bg-transparent border border-near-black/20 focus:border-bronze px-4 py-3 font-inter text-[14px] text-near-black outline-none transition-colors"
      />
    </div>
  );
}
