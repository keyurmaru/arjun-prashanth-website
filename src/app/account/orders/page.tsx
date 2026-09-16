import type { Metadata } from "next";
import Link from "next/link";
import { getCustomerSession } from "@/lib/customerAuth";
import { listOrdersForCustomer } from "@/lib/orders";
import { buildMetadata } from "@/lib/seo";
import LogoutButton from "@/components/account/LogoutButton";

export const metadata: Metadata = {
  ...buildMetadata({ title: "My Orders", description: "Your order history.", path: "/account/orders" }),
  robots: { index: false, follow: false },
};

// Reads live order data from the database, per-request — never
// prerendered, and never cached (this is personalized, per-customer
// content).
export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const session = await getCustomerSession();
  if (!session) return null; // middleware already redirects; this satisfies TS

  const orders = await listOrdersForCustomer(session.sub);

  return (
    <div className="bg-ivory-100 text-near-black min-h-screen">
      <section className="pt-40 pb-16 border-b border-near-black/10">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-10 flex items-center justify-between">
          <div>
            <p className="font-inter text-[11px] tracking-[0.16em] uppercase text-bronze mb-1">My Account</p>
            <h1 className="font-cormorant font-medium text-near-black" style={{ fontSize: "clamp(2rem, 4vw, 2.6rem)" }}>
              Order History
            </h1>
            <p className="font-inter text-[13px] text-near-black/60 mt-2">Signed in as {session.email}</p>
          </div>
          <LogoutButton />
        </div>
      </section>

      <section>
        <div className="max-w-[1000px] mx-auto px-6 lg:px-10 py-12">
          {orders.length === 0 ? (
            <p className="font-inter text-[14px] text-near-black/60">You haven&apos;t placed any orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block border border-near-black/10 p-5 hover:border-bronze transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-inter text-[13px] text-near-black">Order #{order.id}</p>
                      <p className="font-inter text-[12px] text-near-black/50 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-inter text-[12px] uppercase tracking-[0.08em] text-near-black/60">
                        {order.orderStatus.replace("_", " ")}
                      </span>
                      <span className="font-inter text-[14px] text-near-black font-medium">₹{(order.totalPaise / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
