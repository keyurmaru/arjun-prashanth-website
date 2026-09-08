"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderRecord } from "@/lib/orders";

const ORDER_STATUSES = ["pending", "processing", "packed", "shipped", "delivered", "cancelled", "returned"];
const SHIPPING_STATUSES = [
  "not_shipped",
  "shipment_created",
  "awb_assigned",
  "pickup_requested",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "rto",
  "cancelled",
  "failed",
];

export default function OrderStatusForm({ order }: { order: OrderRecord }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderStatus: formData.get("orderStatus"),
        shippingStatus: formData.get("shippingStatus"),
        trackingUrl: formData.get("trackingUrl"),
        awbCode: formData.get("awbCode"),
        adminNotes: formData.get("adminNotes"),
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-black/10 bg-white p-6 space-y-4">
      <p className="text-[12px] tracking-[0.08em] uppercase text-black/50">Update Order</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] text-black/60 mb-1">Order Status</label>
          <select name="orderStatus" defaultValue={order.orderStatus} className="w-full border border-black/20 px-3 py-2 text-[13px]">
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[12px] text-black/60 mb-1">Shipping Status</label>
          <select name="shippingStatus" defaultValue={order.shippingStatus} className="w-full border border-black/20 px-3 py-2 text-[13px]">
            {SHIPPING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] text-black/60 mb-1">AWB (manual override)</label>
          <input name="awbCode" defaultValue={order.awbCode || ""} className="w-full border border-black/20 px-3 py-2 text-[13px]" />
        </div>
        <div>
          <label className="block text-[12px] text-black/60 mb-1">Tracking URL</label>
          <input name="trackingUrl" defaultValue={order.trackingUrl || ""} className="w-full border border-black/20 px-3 py-2 text-[13px]" />
        </div>
      </div>

      <div>
        <label className="block text-[12px] text-black/60 mb-1">Internal Notes</label>
        <textarea name="adminNotes" rows={3} defaultValue={order.adminNotes || ""} className="w-full border border-black/20 px-3 py-2 text-[13px]" />
      </div>

      <button type="submit" disabled={submitting} className="bg-black text-white text-[13px] px-5 py-2.5 disabled:opacity-60">
        {submitting ? "Saving…" : "Save"}
      </button>
      {saved && <span className="ml-3 text-[13px] text-green-700">Saved.</span>}
    </form>
  );
}
