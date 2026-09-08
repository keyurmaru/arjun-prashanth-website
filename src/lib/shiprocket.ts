import type { OrderRecord, ShippingStatus } from "@/lib/orders";

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: { value: string; expiresAt: number } | null = null;

/** The password often contains characters (`$`, `!`, `&`, ...) that Apache's
 * .htaccess `SetEnv` parsing can silently drop the whole directive for —
 * same failure mode the deploy SSH key hit, same fix: base64-encode it in
 * the environment (SHIPROCKET_PASSWORD_B64) and decode here. Falls back to
 * a plain SHIPROCKET_PASSWORD for local dev, where that's not a concern. */
function getPassword(): string | undefined {
  if (process.env.SHIPROCKET_PASSWORD_B64) {
    return Buffer.from(process.env.SHIPROCKET_PASSWORD_B64, "base64").toString("utf-8");
  }
  return process.env.SHIPROCKET_PASSWORD;
}

/** Shiprocket tokens are valid ~10 days; cache in-memory (process-local,
 * same accepted limitation as rateLimit.ts) and refresh a day early. */
export async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const email = process.env.SHIPROCKET_EMAIL;
  const password = getPassword();
  if (!email || !password) {
    throw new Error("Shiprocket not configured — set SHIPROCKET_EMAIL/SHIPROCKET_PASSWORD_B64.");
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Shiprocket login failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { token: string };

  cachedToken = { value: data.token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 };
  return data.token;
}

async function authedFetch(path: string, init: RequestInit = {}) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error(`Shiprocket request failed (${path}): ${res.status} ${await res.text()}`);
  return res.json();
}

function packageTotals(order: OrderRecord) {
  const totalWeightKg = order.items.reduce((sum, i) => sum + (i.weightGrams * i.quantity) / 1000, 0);
  const maxDims = order.items.reduce(
    (max, i) => ({
      length: Math.max(max.length, i.dimensionsCm.length),
      breadth: Math.max(max.breadth, i.dimensionsCm.breadth),
      height: Math.max(max.height, i.dimensionsCm.height),
    }),
    { length: 1, breadth: 1, height: 1 },
  );
  return { weightKg: Math.max(totalWeightKg, 0.05), ...maxDims };
}

/** Creates the Shiprocket order after payment is confirmed. Uses the order's
 * internal id (not the Razorpay order id) as Shiprocket's order_id so it
 * reads cleanly in their dashboard. Multiple line items are packed into one
 * shipment: weight is summed, dimensions take the largest single item (a
 * reasonable approximation for books boxed together). Does NOT assign an
 * AWB or request pickup — those are separate, explicit steps (see
 * assignAWB/requestPickup) so a human decides when a shipment actually
 * commits to a courier, per the integration doc. */
export async function createShiprocketOrder(order: OrderRecord, internalOrderId: number) {
  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;
  if (!pickupLocation) {
    throw new Error("Shiprocket not configured — set SHIPROCKET_PICKUP_LOCATION.");
  }

  const pkg = packageTotals(order);

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
      sku: i.sku || `${i.bookSlug}-${i.variantFormat.toLowerCase()}`,
      units: i.quantity,
      selling_price: i.unitPricePaise / 100,
    })),
    payment_method: "Prepaid",
    sub_total: order.subtotalPaise / 100,
    length: pkg.length,
    breadth: pkg.breadth,
    height: pkg.height,
    weight: pkg.weightKg,
  };

  const data = (await authedFetch("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as { order_id: number; shipment_id: number };

  return { shiprocketOrderId: String(data.order_id), shipmentId: String(data.shipment_id) };
}

export interface ServiceabilityOption {
  courierId: string;
  courierName: string;
  rate: number;
  etd: string;
}

export async function checkServiceability(
  pickupPincode: string,
  deliveryPincode: string,
  weightKg: number,
): Promise<ServiceabilityOption[]> {
  const data = (await authedFetch(
    `/courier/serviceability/?pickup_postcode=${encodeURIComponent(pickupPincode)}&delivery_postcode=${encodeURIComponent(deliveryPincode)}&weight=${weightKg}&cod=0`,
  )) as { data?: { available_courier_companies?: { courier_company_id: number; courier_name: string; rate: number; etd: string }[] } };

  return (data.data?.available_courier_companies || []).map((c) => ({
    courierId: String(c.courier_company_id),
    courierName: c.courier_name,
    rate: c.rate,
    etd: c.etd,
  }));
}

/** Assigns an AWB — the courier's own tracking number — to a shipment.
 * Passing no courierId lets Shiprocket pick its recommended courier. */
export async function assignAWB(shipmentId: string, courierId?: string) {
  const data = (await authedFetch("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify({
      shipment_id: Number(shipmentId),
      ...(courierId ? { courier_id: Number(courierId) } : {}),
    }),
  })) as { response?: { data?: { awb_code?: string; courier_name?: string; courier_company_id?: number } } };

  const awb = data.response?.data;
  if (!awb?.awb_code) throw new Error("Shiprocket did not return an AWB code.");
  return { awbCode: awb.awb_code, courierName: awb.courier_name || "", courierId: String(awb.courier_company_id || "") };
}

export async function requestPickup(shipmentId: string): Promise<void> {
  await authedFetch("/courier/generate/pickup", {
    method: "POST",
    body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
  });
}

export async function generateLabel(shipmentId: string): Promise<string> {
  const data = (await authedFetch("/courier/generate/label", {
    method: "POST",
    body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
  })) as { label_url?: string };
  if (!data.label_url) throw new Error("Shiprocket did not return a label URL.");
  return data.label_url;
}

export async function generateInvoice(shiprocketOrderId: string): Promise<string> {
  const data = (await authedFetch("/orders/print/invoice", {
    method: "POST",
    body: JSON.stringify({ ids: [Number(shiprocketOrderId)] }),
  })) as { invoice_url?: string };
  if (!data.invoice_url) throw new Error("Shiprocket did not return an invoice URL.");
  return data.invoice_url;
}

export interface TrackingResult {
  currentStatus: string;
  trackingUrl: string | null;
}

export async function trackAWB(awbCode: string): Promise<TrackingResult> {
  const data = (await authedFetch(`/courier/track/awb/${encodeURIComponent(awbCode)}`)) as {
    tracking_data?: { shipment_track?: { current_status?: string }[]; track_url?: string };
  };
  const status = data.tracking_data?.shipment_track?.[0]?.current_status || "Unknown";
  return { currentStatus: status, trackingUrl: data.tracking_data?.track_url || null };
}

/** Shiprocket's tracking/webhook status text is free-form ("In Transit",
 * "Delivered", "Out For Delivery", "RTO Initiated", ...) — best-effort map
 * onto our fixed enum. Unrecognised text falls back to "in_transit" (the
 * safest "something is happening" state) rather than throwing; the raw
 * string is always preserved separately in last_tracking_event regardless
 * of how well this mapping fits. */
export function mapShiprocketStatus(raw: string): ShippingStatus {
  const s = raw.toLowerCase();
  if (s.includes("delivered")) return "delivered";
  if (s.includes("out for delivery")) return "out_for_delivery";
  if (s.includes("rto")) return "rto";
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("picked up") || s.includes("pickup complete")) return "picked_up";
  if (s.includes("pickup")) return "pickup_requested";
  if (s.includes("awb")) return "awb_assigned";
  if (s.includes("in transit") || s.includes("shipped") || s.includes("dispatch")) return "in_transit";
  return "in_transit";
}

/** Used by the admin shipping-settings "Test Connection" action — verifies
 * credentials work without ever returning them. */
export async function testConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    cachedToken = null; // force a fresh login rather than trusting a stale cache
    await getToken();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
