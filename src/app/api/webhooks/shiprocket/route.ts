import { NextRequest, NextResponse } from "next/server";
import { mapShiprocketStatus } from "@/lib/shiprocket";
import { getOrderByAwbCode, recordTrackingUpdate } from "@/lib/orders";
import { sendShipmentStatusEmail } from "@/lib/fulfillOrder";

// Configure this URL (https://arjunprashanth.com/api/webhooks/shiprocket)
// under Shiprocket > Settings > API > Webhooks, with the same token set as
// SHIPROCKET_WEBHOOK_SECRET here, sent back as the "x-api-key" header.
//
// Shiprocket's webhook payload shape isn't pinned down by their docs the
// way Razorpay's is — this reads the commonly-documented field names
// (awb / current_status) defensively. If Shiprocket sends something this
// doesn't recognise, the request 400s harmlessly rather than corrupting
// order state; check the actual payload against this parsing once live
// traffic arrives.
export async function POST(req: NextRequest) {
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  const provided = req.headers.get("x-api-key");
  if (!secret || !provided || provided !== secret) {
    return NextResponse.json({ ok: false, error: "Invalid or missing webhook token." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  const awb = String(body.awb || body.awb_code || "");
  const rawStatus = String(body.current_status || body.shipment_status || body.status || "");
  if (!awb || !rawStatus) {
    return NextResponse.json({ ok: false, error: "Missing awb/status in payload." }, { status: 400 });
  }

  const order = await getOrderByAwbCode(awb);
  if (!order) {
    // Not necessarily an error — could be a shipment from before this AWB
    // was recorded, or a test event. Acknowledge so Shiprocket doesn't retry.
    return NextResponse.json({ ok: true, note: "No matching order for this AWB." });
  }

  const mappedStatus = mapShiprocketStatus(rawStatus);
  const trackingUrlRaw = body.track_url || body.tracking_url;
  const { previousStatus } = await recordTrackingUpdate(order.id, {
    shippingStatus: mappedStatus,
    lastTrackingEvent: rawStatus,
    trackingUrl: typeof trackingUrlRaw === "string" ? trackingUrlRaw : undefined,
  });

  // Only email on a genuine transition — never on a repeat webhook
  // delivery of a status the order is already at.
  if (previousStatus !== mappedStatus) {
    const updated = await getOrderByAwbCode(awb);
    if (updated) {
      const enteringTransit =
        mappedStatus === "picked_up" || mappedStatus === "in_transit" || mappedStatus === "out_for_delivery";
      const wasAlreadyMoving =
        previousStatus === "picked_up" || previousStatus === "in_transit" || previousStatus === "out_for_delivery";
      if (enteringTransit && !wasAlreadyMoving) {
        await sendShipmentStatusEmail(updated, "shipped");
      } else if (mappedStatus === "delivered") {
        await sendShipmentStatusEmail(updated, "delivered");
      }
    }
  }

  return NextResponse.json({ ok: true });
}
