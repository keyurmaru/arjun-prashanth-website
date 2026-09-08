import type { OrderRecord } from "@/lib/orders";

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: { value: string; expiresAt: number } | null = null;

/** Shiprocket tokens are valid ~10 days; cache in-memory (process-local,
 * same accepted limitation as rateLimit.ts) and refresh a day early. */
async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const { SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD } = process.env;
  if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
    throw new Error("Shiprocket not configured — set SHIPROCKET_EMAIL/SHIPROCKET_PASSWORD.");
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Shiprocket login failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { token: string };

  cachedToken = { value: data.token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 };
  return data.token;
}

/** Creates the Shiprocket order after payment is confirmed. Uses the order's
 * internal id (not the Razorpay order id) as Shiprocket's order_id so it
 * reads cleanly in their dashboard. Multiple line items are packed into one
 * shipment: weight is summed, dimensions take the largest single item (a
 * reasonable approximation for books boxed together). */
export async function createShiprocketOrder(order: OrderRecord, internalOrderId: number) {
  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;
  if (!pickupLocation) {
    throw new Error("Shiprocket not configured — set SHIPROCKET_PICKUP_LOCATION.");
  }

  const token = await getToken();

  const totalWeightKg = order.items.reduce((sum, i) => sum + (i.weightGrams * i.quantity) / 1000, 0);
  const maxDims = order.items.reduce(
    (max, i) => ({
      length: Math.max(max.length, i.dimensionsCm.length),
      breadth: Math.max(max.breadth, i.dimensionsCm.breadth),
      height: Math.max(max.height, i.dimensionsCm.height),
    }),
    { length: 1, breadth: 1, height: 1 },
  );

  const payload = {
    order_id: `ORD-${internalOrderId}`,
    order_date: new Date().toISOString().slice(0, 16).replace("T", " "),
    pickup_location: pickupLocation,
    billing_customer_name: order.address.name,
    billing_last_name: "",
    billing_address: order.address.line1,
    billing_address_2: order.address.line2 || "",
    billing_city: order.address.city,
    billing_pincode: order.address.pincode,
    billing_state: order.address.state,
    billing_country: order.address.country,
    billing_email: order.address.email,
    billing_phone: order.address.phone,
    shipping_is_billing: true,
    order_items: order.items.map((i) => ({
      name: `${i.bookTitle} (${i.variantFormat})`,
      sku: `${i.bookSlug}-${i.variantFormat.toLowerCase()}`,
      units: i.quantity,
      selling_price: i.unitPricePaise / 100,
    })),
    payment_method: "Prepaid",
    sub_total: order.subtotalPaise / 100,
    length: maxDims.length,
    breadth: maxDims.breadth,
    height: maxDims.height,
    weight: Math.max(totalWeightKg, 0.05),
  };

  const res = await fetch(`${BASE_URL}/orders/create/adhoc`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Shiprocket order creation failed: ${res.status} ${await res.text()}`);

  const data = (await res.json()) as { order_id: number; shipment_id: number };
  return { shiprocketOrderId: String(data.order_id), shipmentId: String(data.shipment_id) };
}
