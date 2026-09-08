import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CheckoutPageClient from "@/components/CheckoutPageClient";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({ title: "Checkout", description: "Complete your book order.", path: "/checkout" }),
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="bg-ivory-100 text-near-black min-h-screen">
      <section className="pt-40 pb-16 border-b border-near-black/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
          <h1 className="font-cormorant font-medium text-near-black mt-4" style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}>
            Checkout
          </h1>
        </div>
      </section>

      <section>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
          <CheckoutPageClient />
        </div>
      </section>
    </div>
  );
}
