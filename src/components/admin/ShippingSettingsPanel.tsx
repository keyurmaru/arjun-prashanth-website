"use client";

import { useState } from "react";

export default function ShippingSettingsPanel({
  configured,
  pickupLocation,
  webhookConfigured,
}: {
  configured: boolean;
  pickupLocation: string | null;
  webhookConfigured: boolean;
}) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  async function handleTest() {
    setTesting(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/settings/shipping/test", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ ok: false, error: "Network error." });
    }
    setTesting(false);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-medium mb-6">Shipping — Shiprocket</h1>

      <div className="border border-black/10 bg-white p-6 space-y-3 text-[14px]">
        <Row label="Configuration" value={configured ? "Configured" : "Not configured"} ok={configured} />
        <Row label="Pickup Location" value={pickupLocation || "Not set"} ok={!!pickupLocation} />
        <Row label="Webhook Secret" value={webhookConfigured ? "Configured" : "Not configured"} ok={webhookConfigured} />
      </div>

      <button
        type="button"
        onClick={handleTest}
        disabled={testing || !configured}
        className="mt-6 bg-black text-white text-[13px] px-5 py-2.5 disabled:opacity-50"
      >
        {testing ? "Testing…" : "Test Connection"}
      </button>

      {result && (
        <p className={`text-[13px] mt-3 ${result.ok ? "text-green-700" : "text-red-600"}`}>
          {result.ok ? "Connection successful." : `Connection failed: ${result.error}`}
        </p>
      )}

      <p className="text-[12px] text-black/40 mt-8">
        Credentials, the pickup location, and the webhook secret are set as server environment variables
        (SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD, SHIPROCKET_PICKUP_LOCATION, SHIPROCKET_WEBHOOK_SECRET) — never
        exposed here.
      </p>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex justify-between border-b border-black/5 py-2">
      <span className="text-black/50">{label}</span>
      <span className={ok ? "text-green-700" : "text-black/70"}>{value}</span>
    </div>
  );
}
