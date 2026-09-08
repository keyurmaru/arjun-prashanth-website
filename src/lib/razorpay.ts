import Razorpay from "razorpay";
import crypto from "crypto";

let client: Razorpay | null = null;

function getClient(): Razorpay {
  if (client) return client;
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay not configured — set RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET.");
  }
  client = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  return client;
}

export async function createRazorpayOrder(amountPaise: number, receipt: string) {
  const order = await getClient().orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt,
  });
  return order;
}

/** Fetches the payment method (card/upi/netbanking/wallet/emi) for a
 * captured payment. Checkout.js's client-side success callback doesn't
 * include this, so the client-verify path calls this itself; the webhook
 * path already has it inline on the event payload. */
export async function getPaymentMethod(paymentId: string): Promise<string | null> {
  try {
    const payment = await getClient().payments.fetch(paymentId);
    return payment.method || null;
  } catch (err) {
    console.error(`[razorpay] Could not fetch payment ${paymentId}:`, err);
    return null;
  }
}

/** Verifies the signature Razorpay Checkout.js returns to the client on
 * payment success (HMAC-SHA256 of "order_id|payment_id" using the key
 * secret). This alone is not sufficient proof of payment — always treat the
 * webhook as the source of truth — but it lets us confirm the order to the
 * customer immediately without waiting on the webhook to land. */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const { RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/** Verifies a Razorpay webhook request body against the X-Razorpay-Signature
 * header, using the separate webhook secret configured in the Razorpay
 * dashboard (not the API key secret). */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
