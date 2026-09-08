import { getOrderByRazorpayOrderId, markOrderPaid, recordShipmentCreated, markShipmentFailed, type OrderRecord } from "@/lib/orders";
import { createShiprocketOrder } from "@/lib/shiprocket";
import { decrementStock } from "@/lib/booksRepo";
import { sendMail } from "@/lib/mailer";
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
export async function fulfillPaidOrder(razorpayOrderId: string, razorpayPaymentId: string): Promise<void> {
  const transitioned = await markOrderPaid(razorpayOrderId, razorpayPaymentId);
  if (!transitioned) return;

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

  const itemLines = order.items.map((i) => {
    const extras = [i.signed && "Signed", i.personalisationMessage && `Personalised: "${i.personalisationMessage}"`]
      .filter(Boolean)
      .join(", ");
    return `${i.quantity} x ${i.bookTitle} (${i.variantFormat})${extras ? ` [${extras}]` : ""} — ₹${(i.unitPricePaise / 100).toFixed(2)} each`;
  });
  const addressLines = [
    order.address.line1,
    order.address.line2,
    `${order.address.city}, ${order.address.state} ${order.address.pincode}`,
    order.address.country,
  ].filter(Boolean);

  const summary = [
    `Order #${order.id} — payment ${razorpayPaymentId}`,
    ...(oversold.length > 0
      ? ["", `⚠ OVERSOLD — payment captured but insufficient stock for: ${oversold.join(", ")}. Resolve manually (refund or restock).`]
      : []),
    ...(shipmentFailed
      ? ["", `⚠ SHIPMENT CREATION FAILED — payment is fine, but the Shiprocket order didn't get created. Retry from the order's admin page.`]
      : []),
    ``,
    `Customer: ${order.address.name}`,
    `Email: ${order.address.email}`,
    `Phone: ${order.address.phone}`,
    `Address: ${addressLines.join(", ")}`,
    ``,
    `Items:`,
    ...itemLines,
    ``,
    `Subtotal: ₹${(order.subtotalPaise / 100).toFixed(2)}`,
    `Shipping: ₹${(order.shippingPaise / 100).toFixed(2)}`,
    `Total: ₹${(order.totalPaise / 100).toFixed(2)}`,
  ].join("\n");

  const notifyTo = process.env.ORDER_NOTIFICATION_EMAIL || process.env.CONTACT_FORM_TO_EMAIL || site.email;
  await sendMail({ to: notifyTo, subject: `[Order #${order.id}] New paid order`, text: summary });

  const customerText = [
    `Thank you for your order, ${order.address.name}!`,
    ``,
    `Here's what you ordered:`,
    ...itemLines,
    ``,
    `Total paid: ₹${(order.totalPaise / 100).toFixed(2)}`,
    ``,
    `We'll ship to:`,
    ...addressLines,
    ``,
    `You'll receive a separate update once your order is dispatched.`,
    ``,
    `— ${site.name}`,
  ].join("\n");
  await sendMail({ to: order.address.email, subject: `Your order #${order.id} is confirmed`, text: customerText });
}

/** Sent from the Shiprocket tracking webhook when shipping_status genuinely
 * transitions (guarded by the caller comparing previousStatus) — never on a
 * repeat webhook delivery of a status the order is already at. */
export async function sendShipmentStatusEmail(order: OrderRecord, event: "shipped" | "delivered"): Promise<void> {
  const trackingLine = order.trackingUrl ? `Track your order: ${order.trackingUrl}` : "";
  const awbLine = order.awbCode ? `AWB: ${order.awbCode}${order.courierName ? ` (${order.courierName})` : ""}` : "";

  const text =
    event === "shipped"
      ? [
          `Good news, ${order.address.name} — your order #${order.id} has shipped!`,
          ``,
          awbLine,
          trackingLine,
          ``,
          `— ${site.name}`,
        ]
      : [
          `Your order #${order.id} has been delivered. We hope you enjoy it!`,
          ``,
          `— ${site.name}`,
        ];

  await sendMail({
    to: order.address.email,
    subject: event === "shipped" ? `Your order #${order.id} has shipped` : `Your order #${order.id} was delivered`,
    text: text.filter(Boolean).join("\n"),
  });
}
