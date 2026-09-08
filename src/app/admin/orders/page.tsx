import Link from "next/link";
import { listOrders, type PaymentStatus, type OrderStatus } from "@/lib/orders";

const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded", "partially_refunded"];
const ORDER_STATUSES: OrderStatus[] = ["pending", "processing", "packed", "shipped", "delivered", "cancelled", "returned"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; paymentStatus?: string; orderStatus?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const paymentStatus = PAYMENT_STATUSES.find((s) => s === sp.paymentStatus);
  const orderStatus = ORDER_STATUSES.find((s) => s === sp.orderStatus);
  const { orders, total } = await listOrders({
    page: sp.page ? Number(sp.page) : 1,
    paymentStatus,
    orderStatus,
    search: sp.search,
  });

  return (
    <div>
      <h1 className="text-2xl font-medium mb-6">Orders</h1>

      <form className="flex flex-wrap gap-3 mb-6" method="get">
        <input
          type="text"
          name="search"
          defaultValue={sp.search}
          placeholder="Search name, email, order #"
          className="border border-black/20 px-3 py-2 text-[13px] outline-none focus:border-black"
        />
        <select name="paymentStatus" defaultValue={sp.paymentStatus || ""} className="border border-black/20 px-3 py-2 text-[13px]">
          <option value="">All payment statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="partially_refunded">Partially Refunded</option>
        </select>
        <select name="orderStatus" defaultValue={sp.orderStatus || ""} className="border border-black/20 px-3 py-2 text-[13px]">
          <option value="">All order statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
        </select>
        <button type="submit" className="bg-black text-white text-[13px] px-4 py-2">
          Filter
        </button>
      </form>

      <table className="w-full text-[14px] bg-white border border-black/10">
        <thead>
          <tr className="border-b border-black/10 text-left text-[11px] uppercase tracking-[0.08em] text-black/50">
            <th className="p-3">Order</th>
            <th className="p-3">Customer</th>
            <th className="p-3">Payment</th>
            <th className="p-3">Order Status</th>
            <th className="p-3">Total</th>
            <th className="p-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-black/5">
              <td className="p-3">
                <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                  #{order.id}
                </Link>
              </td>
              <td className="p-3">{order.address.name}</td>
              <td className="p-3 capitalize">{order.paymentStatus.replace("_", " ")}</td>
              <td className="p-3 capitalize">{order.orderStatus}</td>
              <td className="p-3">₹{(order.totalPaise / 100).toFixed(2)}</td>
              <td className="p-3 text-black/50">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-black/40">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <p className="text-[12px] text-black/40 mt-3">{total} total orders</p>
    </div>
  );
}
