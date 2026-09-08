import ShippingSettingsPanel from "@/components/admin/ShippingSettingsPanel";

export default function ShippingSettingsPage() {
  return (
    <ShippingSettingsPanel
      configured={!!(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD)}
      pickupLocation={process.env.SHIPROCKET_PICKUP_LOCATION || null}
      webhookConfigured={!!process.env.SHIPROCKET_WEBHOOK_SECRET}
    />
  );
}
