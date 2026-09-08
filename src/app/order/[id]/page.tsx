import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getOrderById } from "@/lib/orders";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({ title: "Order Confirmed", description: "Your order confirmation.", path: "/order" }),
  robots: { index: false, follow: false },
};

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const order = await getOrderById(orderId);
  if (!order || order.paymentStatus !== "paid") notFound();

  return (
    <div className="bg-ivory-100 text-near-black min-h-screen">
      <section className="pt-40 pb-16 border-b border-near-black/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Order Confirmed" }]} />
        </div>
      </section>

      <section>
        <div className="max-w-[720px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
          <h1 className="font-cormorant font-medium text-near-black" style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)" }}>
            Thank you, {order.address.name.split(" ")[0]}!
          </h1>
          <p className="font-inter text-[14px] text-near-black/70 mt-3">
            Your order #{order.id} is confirmed. A confirmation email has been sent to {order.address.email}.
          </p>

          <div className="border border-near-black/10 p-6 mt-10">
            <p className="font-inter text-[11px] tracking-[0.16em] uppercase text-near-black/60 mb-4">Order Summary</p>
            <div className="space-y-2 mb-4">
              {order.items.map((item) => (
                <div
                  key={`${item.bookSlug}-${item.variantFormat}`}
                  className="flex justify-between font-inter text-[13px] text-near-black/80"
                >
                  <span>
                    {item.bookTitle} ({item.variantFormat}){item.signed ? ", Signed" : ""} x{item.quantity}
                  </span>
                  <span>₹{((item.unitPricePaise * item.quantity) / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-inter text-[13px] text-near-black/70 pt-3 border-t border-near-black/10">
              <span>Shipping</span>
              <span>₹{(order.shippingPaise / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-inter text-[15px] text-near-black font-medium mt-3 pt-3 border-t border-near-black/10">
              <span>Total Paid</span>
              <span>₹{(order.totalPaise / 100).toFixed(2)}</span>
            </div>
          </div>

          <p className="font-inter text-[13px] text-near-black/60 mt-8">
            Shipping to: {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city},{" "}
            {order.address.state} {order.address.pincode}
          </p>

          <Link
            href="/books"
            className="inline-block mt-10 font-inter text-[11px] tracking-[0.16em] uppercase px-8 py-3.5 border border-near-black text-near-black hover:bg-near-black hover:text-ivory-100 transition-colors duration-300"
          >
            Continue Browsing
          </Link>
        </div>
      </section>
    </div>
  );
}
