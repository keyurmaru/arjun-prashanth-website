import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { isRateLimited } from "@/lib/rateLimit";
import { getPurchasableVariant } from "@/content/books";
import { createRazorpayOrder } from "@/lib/razorpay";
import { createOrder, type ResolvedOrderItem } from "@/lib/orders";

// Flat domestic shipping fee (India only, per the published Shipping &
// Delivery policy) — one flat charge per order, not per item.
const SHIPPING_PAISE = 6000;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`order-create:${ip}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const data = parsed.data;

  if (data.country.trim().toLowerCase() !== "india") {
    return NextResponse.json({ ok: false, error: "We currently only ship within India." }, { status: 400 });
  }

  // Resolve every line item's price/shipping data server-side — never trust
  // a client-submitted price.
  const resolvedItems: ResolvedOrderItem[] = [];
  for (const line of data.items) {
    const match = getPurchasableVariant(line.bookSlug, line.format);
    if (!match) {
      return NextResponse.json(
        { ok: false, error: `"${line.bookSlug}" (${line.format}) is not currently available for purchase.` },
        { status: 400 },
      );
    }
    resolvedItems.push({
      bookSlug: match.book.slug,
      bookTitle: match.book.title,
      variantFormat: match.variant.format,
      unitPricePaise: Math.round(match.variant.priceINR * 100),
      quantity: line.quantity,
      weightGrams: match.variant.weightGrams,
      dimensionsCm: match.variant.dimensionsCm,
    });
  }

  const subtotalPaise = resolvedItems.reduce((sum, i) => sum + i.unitPricePaise * i.quantity, 0);
  const totalPaise = subtotalPaise + SHIPPING_PAISE;

  let razorpayOrder;
  try {
    razorpayOrder = await createRazorpayOrder(totalPaise, `rcpt_${Date.now()}`);
  } catch (err) {
    console.error("[orders/create] Razorpay order creation failed:", err);
    return NextResponse.json({ ok: false, error: "Could not start payment. Please try again shortly." }, { status: 502 });
  }

  try {
    await createOrder({
      razorpayOrderId: razorpayOrder.id,
      address: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 || undefined,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
      },
      items: resolvedItems,
      subtotalPaise,
      shippingPaise: SHIPPING_PAISE,
      totalPaise,
    });
  } catch (err) {
    console.error("[orders/create] Failed to persist order:", err);
    return NextResponse.json({ ok: false, error: "Could not start payment. Please try again shortly." }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    razorpayOrderId: razorpayOrder.id,
    amountPaise: totalPaise,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}
