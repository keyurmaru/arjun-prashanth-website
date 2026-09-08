import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { hasAccess } from "@/lib/auth";
import { cancelOrder } from "@/lib/fulfillOrder";
import { getOrderById } from "@/lib/orders";
import { logAction } from "@/lib/auditLog";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  if (!hasAccess(session.role, "orders_write")) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const orderId = Number(id);

  const result = await cancelOrder(orderId);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  await logAction(session, "order.cancel", "order", orderId);

  const order = await getOrderById(orderId);
  return NextResponse.json({ ok: true, order });
}
