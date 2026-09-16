import { NextRequest, NextResponse } from "next/server";
import { isRateLimited, isBypassedIp } from "@/lib/rateLimit";
import { getPurchasableVariant } from "@/lib/booksRepo";
import { computeShippingPaise } from "@/lib/shippingQuote";

interface QuoteLine {
  bookSlug?: unknown;
  format?: unknown;
  quantity?: unknown;
}

// Live, pincode-based shipping cost for the checkout page — called as the
// customer fills in their PIN code, before they submit the order. The
// order-create route runs this exact same calculation again server-side
// when the order is actually placed (never trusts a client-submitted
// shipping amount); this route exists purely so the customer sees a real
// number before paying, not a surprise at charge time.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!isBypassedIp(ip) && isRateLimited(`shipping-quote:${ip}`, { max: 30, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const { pincode, items } = (body as Record<string, unknown>) || {};
  if (typeof pincode !== "string" || !/^[1-9][0-9]{5}$/.test(pincode) || !Array.isArray(items)) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  let totalWeightKg = 0;
  for (const raw of items as QuoteLine[]) {
    if (typeof raw.bookSlug !== "string" || typeof raw.format !== "string") continue;
    const quantity = typeof raw.quantity === "number" && raw.quantity > 0 ? raw.quantity : 1;
    const match = await getPurchasableVariant(raw.bookSlug, raw.format);
    if (match) totalWeightKg += (match.variant.weightGrams * quantity) / 1000;
  }

  const result = await computeShippingPaise(pincode, Math.max(totalWeightKg, 0.05));
  return NextResponse.json({ ok: true, ...result });
}
