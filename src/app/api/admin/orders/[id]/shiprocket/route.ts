import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { hasAccess } from "@/lib/auth";
import { getOrderById, recordAwbAssigned, recordPickupRequested, recordLabelUrl, recordInvoiceUrl, recordTrackingUpdate } from "@/lib/orders";
import { createShipmentForOrder, sendShipmentStatusEmail } from "@/lib/fulfillOrder";
import { assignAWB, requestPickup, generateLabel, generateInvoice, trackAWB, mapShiprocketStatus } from "@/lib/shiprocket";
import { logAction } from "@/lib/auditLog";

const actionSchema = z.object({
  action: z.enum(["create", "assign_awb", "request_pickup", "generate_label", "generate_invoice", "track"]),
  courierId: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  if (!hasAccess(session.role, "orders_write")) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const orderId = Number(id);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid action." }, { status: 400 });

  const order = await getOrderById(orderId);
  if (!order) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  if (order.paymentStatus !== "paid") {
    return NextResponse.json({ ok: false, error: "Order is not paid — nothing to fulfil yet." }, { status: 400 });
  }

  try {
    switch (parsed.data.action) {
      case "create": {
        const ok = await createShipmentForOrder(order);
        if (!ok) return NextResponse.json({ ok: false, error: "Shiprocket order creation failed. Check server logs." }, { status: 502 });
        break;
      }
      case "assign_awb": {
        if (!order.shiprocketShipmentId) {
          return NextResponse.json({ ok: false, error: "No Shiprocket shipment yet — create the shipment first." }, { status: 400 });
        }
        const awb = await assignAWB(order.shiprocketShipmentId, parsed.data.courierId);
        await recordAwbAssigned(orderId, awb);
        break;
      }
      case "request_pickup": {
        if (!order.shiprocketShipmentId) {
          return NextResponse.json({ ok: false, error: "No Shiprocket shipment yet." }, { status: 400 });
        }
        await requestPickup(order.shiprocketShipmentId);
        await recordPickupRequested(orderId);
        break;
      }
      case "generate_label": {
        if (!order.shiprocketShipmentId) {
          return NextResponse.json({ ok: false, error: "No Shiprocket shipment yet." }, { status: 400 });
        }
        const url = await generateLabel(order.shiprocketShipmentId);
        await recordLabelUrl(orderId, url);
        break;
      }
      case "generate_invoice": {
        if (!order.shiprocketOrderId) {
          return NextResponse.json({ ok: false, error: "No Shiprocket order yet." }, { status: 400 });
        }
        const url = await generateInvoice(order.shiprocketOrderId);
        await recordInvoiceUrl(orderId, url);
        break;
      }
      case "track": {
        if (!order.awbCode) {
          return NextResponse.json({ ok: false, error: "No AWB assigned yet." }, { status: 400 });
        }
        const result = await trackAWB(order.awbCode);
        const mappedStatus = mapShiprocketStatus(result.currentStatus);
        const { previousStatus } = await recordTrackingUpdate(orderId, {
          shippingStatus: mappedStatus,
          lastTrackingEvent: result.currentStatus,
          trackingUrl: result.trackingUrl || undefined,
        });
        if (previousStatus !== mappedStatus) {
          const updated = await getOrderById(orderId);
          if (updated) {
            if (mappedStatus === "delivered") await sendShipmentStatusEmail(updated, "delivered");
            else if (["picked_up", "in_transit", "out_for_delivery"].includes(mappedStatus) && previousStatus && !["picked_up", "in_transit", "out_for_delivery"].includes(previousStatus)) {
              await sendShipmentStatusEmail(updated, "shipped");
            }
          }
        }
        break;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Shiprocket request failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }

  await logAction(session, `shiprocket.${parsed.data.action}`, "order", orderId);

  const updated = await getOrderById(orderId);
  return NextResponse.json({ ok: true, order: updated });
}
