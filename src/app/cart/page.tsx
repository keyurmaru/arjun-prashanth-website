import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CartPageClient from "@/components/CartPageClient";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Your Cart",
  description: "Review your book order before checkout.",
  path: "/cart",
});

export default function CartPage() {
  return (
    <div className="bg-ivory-100 text-near-black min-h-screen">
      <section className="pt-40 pb-16 border-b border-near-black/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
          <h1 className="font-cormorant font-medium text-near-black mt-4" style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}>
            Your Cart
          </h1>
        </div>
      </section>

      <section>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
          <CartPageClient />
        </div>
      </section>
    </div>
  );
}
