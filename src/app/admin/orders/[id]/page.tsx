import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { getSession } from "@/lib/session";
import { hasAccess } from "@/lib/auth";
import OrderStatusForm from "@/components/admin/OrderStatusForm";
import ShiprocketPanel from "@/components/admin/ShiprocketPanel";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(Number(id));
  if (!order) notFound();

  const session = await getSession();
  const canWrite = session ? hasAccess(session.role, "orders_write") : false;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-medium mb-1">Order #{order.id}</h1>
      <p className="text-black/50 text-[13px] mb-6">Placed {new Date(order.createdAt).toLocaleString("en-IN")}</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <InfoCard label="Payment" value={order.paymentStatus.replace("_", " ")} />
        <InfoCard label="Order" value={order.orderStatus} />
        <InfoCard label="Shipping" value={order.shippingStatus.replace("_", " ")} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div className="border border-black/10 bg-white p-6">
          <p className="text-[12px] tracking-[0.08em] uppercase text-black/50 mb-3">Customer</p>
          <p className="text-[14px]">{order.address.name}</p>
          <p className="text-[13px] text-black/60">{order.address.email}</p>
          <p className="text-[13px] text-black/60">{order.address.phone}</p>
          <p className="text-[13px] text-black/60 mt-2">
            {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.state}{" "}
            {order.address.pincode}, {order.address.country}
          </p>
        </div>

        <div className="border border-black/10 bg-white p-6">
          <p className="text-[12px] tracking-[0.08em] uppercase text-black/50 mb-3">Payment</p>
          <p className="text-[13px] text-black/70">Razorpay Order: {order.razorpayOrderId}</p>
          <p className="text-[13px] text-black/70">Razorpay Payment: {order.razorpayPaymentId || "—"}</p>
          <p className="text-[13px] text-black/70 mt-2">Subtotal: ₹{(order.subtotalPaise / 100).toFixed(2)}</p>
          <p className="text-[13px] text-black/70">Shipping: ₹{(order.shippingPaise / 100).toFixed(2)}</p>
          <p className="text-[14px] font-medium mt-1">Total: ₹{(order.totalPaise / 100).toFixed(2)}</p>
        </div>
      </div>

      <div className="border border-black/10 bg-white p-6 mb-6">
        <p className="text-[12px] tracking-[0.08em] uppercase text-black/50 mb-3">Items</p>
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="text-[14px] flex justify-between">
              <span>
                {item.quantity} x {item.bookTitle} ({item.variantFormat})
                {item.sku && <span className="text-black/40"> · SKU {item.sku}</span>}
                {item.signed && " · Signed"}
                {item.personalisationMessage && (
                  <span className="block text-[12px] text-black/50 mt-0.5">
                    Personalisation: &quot;{item.personalisationMessage}&quot;
                  </span>
                )}
              </span>
              <span>₹{((item.unitPricePaise * item.quantity) / 100).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {canWrite ? (
        <>
          <div className="mb-6">
            <ShiprocketPanel order={order} />
          </div>
          <OrderStatusForm order={order} />
        </>
      ) : (
        <p className="text-[13px] text-black/40">You have read-only access to orders.</p>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-black/10 p-4">
      <p className="text-[11px] tracking-[0.08em] uppercase text-black/50">{label}</p>
      <p className="text-[15px] capitalize mt-1">{value}</p>
    </div>
  );
}
