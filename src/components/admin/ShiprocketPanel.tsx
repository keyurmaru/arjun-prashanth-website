"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderRecord } from "@/lib/orders";

const STATUS_LABELS: Record<string, string> = {
  not_shipped: "Not Shipped",
  shipment_created: "Shipment Created",
  awb_assigned: "AWB Assigned",
  pickup_requested: "Pickup Requested",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out For Delivery",
  delivered: "Delivered",
  rto: "RTO",
  cancelled: "Cancelled",
  failed: "Shipment Creation Failed",
};

export default function ShiprocketPanel({ order }: { order: OrderRecord }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(action: string) {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/shiprocket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Action failed.");
        setBusy(null);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
    }
    setBusy(null);
  }

  const canCreate = !order.shiprocketShipmentId;
  const canRetry = order.shippingStatus === "failed";
  const canAssignAwb = !!order.shiprocketShipmentId && !order.awbCode;
  const canRequestPickup = !!order.awbCode && order.shippingStatus !== "pickup_requested" && order.shippingStatus !== "picked_up" && order.shippingStatus !== "delivered";
  const canGenerateLabel = !!order.shiprocketShipmentId;
  const canGenerateInvoice = !!order.shiprocketOrderId;
  const canTrack = !!order.awbCode;

  return (
    <div className="border border-black/10 bg-white p-6">
      <p className="text-[12px] tracking-[0.08em] uppercase text-black/50 mb-4">Shiprocket Fulfilment</p>

      <div className="grid sm:grid-cols-2 gap-3 text-[13px] mb-5">
        <Row label="Shipment Status" value={STATUS_LABELS[order.shippingStatus] || order.shippingStatus} />
        <Row label="Shiprocket Order" value={order.shiprocketOrderId || "—"} />
        <Row label="Shipment ID" value={order.shiprocketShipmentId || "—"} />
        <Row label="Courier" value={order.courierName || "—"} />
        <Row label="AWB" value={order.awbCode || "—"} />
        <Row label="Last Tracking Event" value={order.lastTrackingEvent || "—"} />
      </div>

      {order.shippingStatus === "failed" && (
        <p className="text-[13px] text-red-600 mb-4">
          Shipment creation failed. The order is still marked PAID — nothing else was affected. Retry below.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {canCreate && (
          <ActionButton label="Create Shipment" busy={busy === "create"} onClick={() => runAction("create")} />
        )}
        {canRetry && (
          <ActionButton label="Retry Shipment" busy={busy === "create"} onClick={() => runAction("create")} />
        )}
        {canAssignAwb && (
          <ActionButton label="Assign AWB" busy={busy === "assign_awb"} onClick={() => runAction("assign_awb")} />
        )}
        {canRequestPickup && (
          <ActionButton label="Request Pickup" busy={busy === "request_pickup"} onClick={() => runAction("request_pickup")} />
        )}
        {canGenerateLabel && (
          <ActionButton label="Generate Label" busy={busy === "generate_label"} onClick={() => runAction("generate_label")} />
        )}
        {canGenerateInvoice && (
          <ActionButton label="Generate Invoice" busy={busy === "generate_invoice"} onClick={() => runAction("generate_invoice")} />
        )}
        {canTrack && (
          <ActionButton label="Refresh Tracking" busy={busy === "track"} onClick={() => runAction("track")} />
        )}
      </div>

      {(order.shippingLabelUrl || order.invoiceUrl || order.trackingUrl) && (
        <div className="flex flex-wrap gap-4 mt-4 text-[12px]">
          {order.shippingLabelUrl && (
            <a href={order.shippingLabelUrl} target="_blank" rel="noopener noreferrer" className="text-black/60 hover:text-black underline">
              Download Label
            </a>
          )}
          {order.invoiceUrl && (
            <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-black/60 hover:text-black underline">
              Download Invoice
            </a>
          )}
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-black/60 hover:text-black underline">
              Track Shipment
            </a>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-[13px] text-red-600 mt-4">
          {error}
        </p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-black/5 py-1.5">
      <span className="text-black/50">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function ActionButton({ label, busy, onClick }: { label: string; busy: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="text-[12px] border border-black/20 px-3 py-2 hover:bg-black hover:text-white transition-colors disabled:opacity-50"
    >
      {busy ? "Working…" : label}
    </button>
  );
}
