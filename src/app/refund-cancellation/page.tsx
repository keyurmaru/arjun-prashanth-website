import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Refund & Cancellation Policy",
  description: "Refund & Cancellation Policy for book orders placed on arjunprashanth.com.",
  path: "/refund-cancellation",
});

export default function RefundCancellationPage() {
  return (
    <div className="apr-page apr-legal bg-ivory-100 min-h-screen">
      <section className="apr-ivory apr-section">
        <div className="apr-container max-w-[760px] mx-auto px-6 lg:px-0 pt-40 pb-24">
          <p className="apr-eyebrow">Legal</p>
          <h1 className="apr-h1" style={{ fontSize: "clamp(2rem,4vw,2.6rem)" }}>
            Refund &amp; Cancellation Policy
          </h1>
          <p className="apr-legal-meta">Last updated: 31 August 2026 · Applies to book orders placed on arjunprashanth.com.</p>

          <p className="apr-body">We want you to be satisfied with your order. This policy explains how order cancellations, returns and refunds are handled.</p>

          <h2 className="apr-h2">1. Order cancellation</h2>
          <ul className="apr-legal-list">
            <li>You may cancel an order free of charge at any time before it has been shipped, by contacting us with your order number.</li>
            <li>Once an order has been shipped, it can no longer be cancelled and instead follows the return process below.</li>
          </ul>

          <h2 className="apr-h2">2. Returns and refunds</h2>
          <p className="apr-body">We accept returns and issue a refund or replacement if:</p>
          <ul className="apr-legal-list">
            <li>The book arrives damaged or defective, or</li>
            <li>You received the wrong item</li>
          </ul>
          <p className="apr-body">
            Return requests must be made within <strong>7 days of delivery</strong>, by emailing us with your order
            number and a photo of the issue where applicable. Change-of-mind returns are not accepted once an order
            has shipped.
          </p>

          <h3 className="apr-h3">Personalised / signed copies</h3>
          <p className="apr-body">
            Where a book has been personalised at your request (e.g. a signed copy with a name inscription), it can
            only be returned if it arrives damaged or defective — personalisation itself is non-returnable.
          </p>

          <h2 className="apr-h2">3. Refund process and timeline</h2>
          <p className="apr-body">
            Once a return is approved and the item is received back (where applicable), we will process your refund
            to the original payment method via Razorpay. Refunds are typically credited within{" "}
            <strong>7–10 business days</strong>, though the exact timing can depend on your bank or payment provider.
          </p>

          <h2 className="apr-h2">4. How to request a refund or cancellation</h2>
          <p className="apr-body">
            Email <a href="mailto:author@arjunprashanth.com">author@arjunprashanth.com</a> with your order number and
            the reason for your request. We aim to respond within 2 business days.
          </p>
        </div>
      </section>
    </div>
  );
}
