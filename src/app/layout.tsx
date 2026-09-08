import type { Metadata } from "next";
import { headers } from "next/headers";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { CartProvider } from "@/context/CartContext";
import { site } from "@/content/site";
import { siteUrl, buildMetadata } from "@/lib/seo";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  ...buildMetadata({
    title: `${site.name} — ${site.role}`,
    description: site.tagline,
    path: "/",
  }),
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Set by middleware.ts only for /admin routes — the admin panel has its
  // own layout/theme and shouldn't carry the public site's Header/Footer,
  // cart, or analytics tag.
  const pathname = (await headers()).get("x-pathname") || "";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
        <body className="font-inter">{children}</body>
      </html>
    );
  }

  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-dark-950 text-ivory-100 font-inter">
        <GoogleAnalytics />
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
