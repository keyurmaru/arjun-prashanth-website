import { getDashboardStats } from "@/lib/orders";
import { getLowStockVariants } from "@/lib/booksRepo";
import { getSession } from "@/lib/session";

export default async function AdminDashboardPage() {
  const session = await getSession();
  const [stats, lowStock] = await Promise.all([getDashboardStats(), getLowStockVariants()]);

  return (
    <div>
      <h1 className="text-2xl font-medium mb-1">Dashboard</h1>
      <p className="text-black/50 text-[14px] mb-8">Welcome back, {session?.name}.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Today's Orders" value={stats.todayOrders} />
        <StatCard label="Pending Payment" value={stats.pendingPayments} />
        <StatCard label="Paid Orders" value={stats.paidOrders} />
        <StatCard label="Failed Payments" value={stats.failedPayments} />
        <StatCard label="Shipment Failures" value={stats.failedShipments} />
        <StatCard label="Total Revenue" value={`₹${(stats.revenuePaise / 100).toLocaleString("en-IN")}`} />
      </div>

      <div className="bg-white border border-black/10 p-6">
        <p className="text-[12px] tracking-[0.1em] uppercase text-black/50 mb-4">Low Stock</p>
        {lowStock.length === 0 ? (
          <p className="text-[14px] text-black/50">Nothing is low on stock.</p>
        ) : (
          <ul className="space-y-2">
            {lowStock.map((v, i) => (
              <li key={i} className="flex justify-between text-[14px]">
                <span>
                  {v.bookTitle} ({v.format})
                </span>
                <span className={v.stock === 0 ? "text-red-600 font-medium" : "text-amber-600"}>
                  {v.stock} left (threshold {v.lowStockThreshold})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-black/10 p-5">
      <p className="text-[11px] tracking-[0.08em] uppercase text-black/50">{label}</p>
      <p className="text-2xl font-medium mt-2">{value}</p>
    </div>
  );
}
