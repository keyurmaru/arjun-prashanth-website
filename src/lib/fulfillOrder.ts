import {
  getOrderById,
  getOrderByRazorpayOrderId,
  markOrderPaid,
  recordPaymentMethod,
  setOrderCancelled,
  recordShipmentCreated,
  markShipmentFailed,
  type OrderRecord,
} from "@/lib/orders";
import { createShiprocketOrder } from "@/lib/shiprocket";
import { decrementStock, restoreStock } from "@/lib/booksRepo";
import { getPaymentMethod } from "@/lib/razorpay";
import { sendMail } from "@/lib/mailer";
import { orderConfirmationEmail, newOrderAdminEmail, shipmentStatusEmail } from "@/lib/email/templates";
import { site } from "@/content/site";

/** Creates the Shiprocket order for an already-paid order. Shared by the
 * automatic post-payment flow and the admin "Retry Shipment" action, so
 * both go through the exact same success/failure handling. Returns whether
 * it succeeded — never throws. */
export async function createShipmentForOrder(order: OrderRecord): Promise<boolean> {
  try {
    const shiprocket = await createShiprocketOrder(order, order.id);
    await recordShipmentCreated(order.razorpayOrderId, shiprocket);
    return true;
  } catch (err) {
    console.error(`[fulfillOrder] Shiprocket order creation failed for order #${order.id}:`, err);
    await markShipmentFailed(order.id);
    return false;
  }
}

/** Called from both the client-side verify endpoint and the Razorpay
 * webhook — whichever lands first does the work; markOrderPaid's
 * pending->paid transition is the idempotency guard so stock deduction,
 * Shiprocket order creation, and the emails never fire twice for the same
 * payment. */
export async function fulfillPaidOrder(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  paymentMethod?: string | null,
): Promise<void> {
  // The webhook payload has the method inline; the client-verify path
  // doesn't (Checkout.js's success callback only returns the IDs +
  // signature), so fetch it from the API when the caller doesn't already
  // know it.
  const method = paymentMethod !== undefined ? paymentMethod : await getPaymentMethod(razorpayPaymentId);

  const transitioned = await markOrderPaid(razorpayOrderId, razorpayPaymentId, method);
  if (!transitioned) {
    // Already paid (e.g. webhook landed first) — still worth recording the
    // method if this call learned it and the earlier one didn't.
    if (method) await recordPaymentMethod(razorpayOrderId, method);
    return;
  }

  const order = await getOrderByRazorpayOrderId(razorpayOrderId);
  if (!order) return;

  const oversold: string[] = [];
  for (const item of order.items) {
    const ok = await decrementStock(item.variantId, item.quantity);
    if (!ok) {
      // Stock ran out between checkout and payment completing (two
      // customers racing for the last copy). The payment is already
      // captured — we don't auto-refund here, just flag it loudly so it
      // gets resolved manually (refund or restock).
      oversold.push(`${item.bookTitle} (${item.variantFormat}) x${item.quantity}`);
      console.error(`[fulfillOrder] Oversold on order #${order.id}: ${item.bookTitle} (${item.variantFormat})`);
    }
  }

  // Payment is captured and recorded either way — per the Shiprocket
  // integration doc's "Critical Failure Rule," a fulfilment failure must
  // never fail or cancel an already-paid order; createShipmentForOrder
  // flags it as a shipping state (shown in /admin/orders with a Retry
  // Shipment action) instead.
  const shipmentOk = await createShipmentForOrder(order);
  const shipmentFailed = !shipmentOk;

  const notifyTo = process.env.ORDER_NOTIFICATION_EMAIL || process.env.CONTACT_FORM_TO_EMAIL || site.email;
  const adminEmail = newOrderAdminEmail(order, razorpayPaymentId, { oversold, shipmentFailed });
  await sendMail({ to: notifyTo, subject: adminEmail.subject, text: adminEmail.text, html: adminEmail.html });

  const customerEmail = orderConfirmationEmail(order);
  await sendMail({ to: order.address.email, subject: customerEmail.subject, text: customerEmail.text, html: customerEmail.html });
}

/** Cancels an order — if it was paid (and stock was therefore already
 * deducted), restores it first. Idempotent: cancelling an order that's
 * already cancelled is a no-op. Does NOT touch payment_status or trigger a
 * Razorpay refund — that's a separate, deliberate action for the admin to
 * take in the Razorpay dashboard, not something to fire automatically
 * alongside a status change. */
export async function cancelOrder(orderId: number): Promise<{ ok: boolean; error?: string }> {
  const order = await getOrderById(orderId);
  if (!order) return { ok: false, error: "Order not found." };
  if (order.orderStatus === "cancelled") return { ok: true };

  if (order.paymentStatus === "paid") {
    for (const item of order.items) {
      await restoreStock(item.variantId, item.quantity);
    }
  }

  await setOrderCancelled(orderId);
  return { ok: true };
}

/** Sent from the Shiprocket tracking webhook when shipping_status genuinely
 * transitions (guarded by the caller comparing previousStatus) — never on a
 * repeat webhook delivery of a status the order is already at. */
export async function sendShipmentStatusEmail(order: OrderRecord, event: "shipped" | "delivered"): Promise<void> {
  const email = shipmentStatusEmail(order, event);
  await sendMail({ to: order.address.email, subject: email.subject, text: email.text, html: email.html });
}
