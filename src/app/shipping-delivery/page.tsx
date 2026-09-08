import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Shipping & Delivery Policy",
  description: "Shipping & Delivery Policy for book orders placed on arjunprashanth.com.",
  path: "/shipping-delivery",
});

export default function ShippingDeliveryPage() {
  return (
    <div className="apr-page apr-legal bg-ivory-100 min-h-screen">
      <section className="apr-ivory apr-section">
        <div className="apr-container max-w-[760px] mx-auto px-6 lg:px-0 pt-40 pb-24">
          <p className="apr-eyebrow">Legal</p>
          <h1 className="apr-h1" style={{ fontSize: "clamp(2rem,4vw,2.6rem)" }}>
            Shipping &amp; Delivery Policy
          </h1>
          <p className="apr-legal-meta">Last updated: 07 September 2026 · Applies to book orders placed on arjunprashanth.com.</p>

          <h2 className="apr-h2">1. Shipping coverage</h2>
          <p className="apr-body">We currently ship within India. International shipping is not yet available.</p>

          <h2 className="apr-h2">2. Order processing time</h2>
          <p className="apr-body">Orders are typically processed and handed to our courier partner within a few business days of payment confirmation.</p>

          <h2 className="apr-h2">3. Delivery timeline</h2>
          <p className="apr-body">Delivery timelines depend on your location and the courier partner used.</p>

          <h2 className="apr-h2">4. Shipping charges</h2>
          <p className="apr-body">Any applicable shipping charges will be shown clearly at checkout before you complete your order.</p>

          <h2 className="apr-h2">5. Order tracking</h2>
          <p className="apr-body">Once your order ships, we will email you tracking details so you can follow its progress to delivery.</p>

          <h2 className="apr-h2">6. Delays</h2>
          <p className="apr-body">
            Occasionally, delivery may be delayed due to circumstances outside our control (courier disruptions,
            weather, regional restrictions, etc.). We will keep you informed if this affects your order.
          </p>

          <h2 className="apr-h2">7. Questions about your delivery</h2>
          <p className="apr-body">
            Contact <a href="mailto:author@arjunprashanth.com">author@arjunprashanth.com</a> with your order number
            for any shipping or delivery question.
          </p>
        </div>
      </section>
    </div>
  );
}
