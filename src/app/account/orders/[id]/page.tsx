import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerSession } from "@/lib/customerAuth";
import { getOrderById } from "@/lib/orders";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({ title: "Order Details", description: "Your order details.", path: "/account/orders" }),
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getCustomerSession();
  if (!session) return null; // middleware already redirects

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const order = await getOrderById(orderId);
  // Ownership check — a customer can only ever see their own order,
  // regardless of whether they can guess another order's numeric id.
  if (!order || order.customerId !== session.sub) notFound();

  return (
    <div className="bg-ivory-100 text-near-black min-h-screen">
      <section className="pt-40 pb-10 border-b border-near-black/10">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          <Link href="/account/orders" className="font-inter text-[11px] tracking-[0.14em] uppercase text-bronze hover:text-near-black transition-colors">
            ← Back to Order History
          </Link>
          <h1 className="font-cormorant font-medium text-near-black mt-4" style={{ fontSize: "clamp(2rem, 4vw, 2.6rem)" }}>
            Order #{order.id}
          </h1>
          <p className="font-inter text-[13px] text-near-black/60 mt-2">
            Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </section>

      <section>
        <div className="max-w-[720px] mx-auto px-6 lg:px-10 py-12">
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <StatusCard label="Payment" value={order.paymentStatus.replace("_", " ")} />
            <StatusCard label="Order" value={order.orderStatus} />
            <StatusCard label="Shipping" value={order.shippingStatus.replace(/_/g, " ")} />
          </div>

          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mb-8 font-inter text-[11px] tracking-[0.16em] uppercase px-6 py-3 bg-near-black text-ivory-100 hover:bg-bronze hover:text-near-black transition-colors duration-300"
            >
              Track Shipment
            </a>
          )}

          <div className="border border-near-black/10 p-6">
            <p className="font-inter text-[11px] tracking-[0.16em] uppercase text-near-black/60 mb-4">Items</p>
            <div className="space-y-2 mb-4">
              {order.items.map((item) => (
                <div key={`${item.bookSlug}-${item.variantFormat}`} className="flex justify-between font-inter text-[13px] text-near-black/80">
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
        </div>
      </section>
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-near-black/10 p-4">
      <p className="font-inter text-[10px] tracking-[0.12em] uppercase text-near-black/50">{label}</p>
      <p className="font-inter text-[14px] capitalize text-near-black mt-1">{value}</p>
    </div>
  );
}
