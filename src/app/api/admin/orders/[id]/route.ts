import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { hasAccess } from "@/lib/auth";
import { getOrderById, updateOrderAdminFields } from "@/lib/orders";
import { logAction } from "@/lib/auditLog";

const patchSchema = z.object({
  orderStatus: z.enum(["pending", "processing", "packed", "shipped", "delivered", "cancelled", "returned"]).optional(),
  shippingStatus: z.enum(["not_shipped", "label_created", "shipped", "delivered"]).optional(),
  trackingUrl: z.string().max(300).optional(),
  awbCode: z.string().max(64).optional(),
  adminNotes: z.string().max(5000).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(Number(id));
  if (!order) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  return NextResponse.json({ ok: true, order });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });

  // Middleware only gates read access to /api/admin/orders/*; mutating an
  // order needs the stricter orders_write role (VIEWER can reach this route
  // for GET but must not be able to PATCH it).
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

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid update." }, { status: 400 });
  }

  await updateOrderAdminFields(orderId, parsed.data);
  await logAction(session, "order.update", "order", orderId, parsed.data);
  return NextResponse.json({ ok: true });
}
