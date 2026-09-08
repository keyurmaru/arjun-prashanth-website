import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { fulfillPaidOrder } from "@/lib/fulfillOrder";

// Source of truth for payment confirmation — configure this URL
// (https://arjunprashanth.com/api/webhooks/razorpay) under Settings >
// Webhooks in the Razorpay dashboard, subscribed to "payment.captured",
// with RAZORPAY_WEBHOOK_SECRET set to the same secret entered there.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: "Invalid signature." }, { status: 400 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id && payment?.id) {
      await fulfillPaidOrder(payment.order_id, payment.id);
    }
  }

  return NextResponse.json({ ok: true });
}
