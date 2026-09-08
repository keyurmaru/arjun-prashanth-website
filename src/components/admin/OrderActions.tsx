"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderRecord } from "@/lib/orders";

export default function OrderActions({ order }: { order: OrderRecord }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"cancel" | "fulfill" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!confirm(order.paymentStatus === "paid" ? "Cancel this order and restore stock? This does not process a Razorpay refund — do that separately if needed." : "Cancel this order?")) return;
    setBusy("cancel");
    setError(null);
    const res = await fetch(`/api/admin/orders/${order.id}/cancel`, { method: "POST" });
    const data = await res.json();
    setBusy(null);
    if (!res.ok || !data.ok) {
      setError(data.error || "Could not cancel the order.");
      return;
    }
    router.refresh();
  }

  async function handleFulfill() {
    if (!confirm("Mark this order as fulfilled (delivered)?")) return;
    setBusy("fulfill");
    setError(null);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus: "delivered" }),
    });
    setBusy(null);
    if (!res.ok) {
      setError("Could not update the order.");
      return;
    }
    router.refresh();
  }

  const alreadyCancelled = order.orderStatus === "cancelled";
  const alreadyDelivered = order.orderStatus === "delivered";

  if (alreadyCancelled) {
    return <p className="text-[13px] text-black/50">This order is cancelled.</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!alreadyDelivered && (
        <button
          type="button"
          onClick={handleFulfill}
          disabled={busy !== null}
          className="text-[12px] border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors disabled:opacity-50"
        >
          {busy === "fulfill" ? "Working…" : "Mark Fulfilled"}
        </button>
      )}
      <button
        type="button"
        onClick={handleCancel}
        disabled={busy !== null}
        className="text-[12px] border border-red-300 text-red-600 px-4 py-2 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors disabled:opacity-50"
      >
        {busy === "cancel" ? "Working…" : "Cancel Order"}
      </button>
      {error && (
        <p role="alert" className="text-[13px] text-red-600 basis-full">
          {error}
        </p>
      )}
    </div>
  );
}
