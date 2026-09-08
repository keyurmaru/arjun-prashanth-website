import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { fulfillPaidOrder } from "@/lib/fulfillOrder";
import { getOrderByRazorpayOrderId } from "@/lib/orders";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = (body as Record<string, unknown>) || {};
  if (
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string"
  ) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ ok: false, error: "Payment could not be verified." }, { status: 400 });
  }

  await fulfillPaidOrder(razorpay_order_id, razorpay_payment_id);

  const order = await getOrderByRazorpayOrderId(razorpay_order_id);
  return NextResponse.json({ ok: true, orderId: order?.id });
}
