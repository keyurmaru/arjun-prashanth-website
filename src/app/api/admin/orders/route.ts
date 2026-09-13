import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { hasAccess } from "@/lib/auth";
import { listOrders, type PaymentStatus, type OrderStatus } from "@/lib/orders";

const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded", "partially_refunded"];
const ORDER_STATUSES: OrderStatus[] = ["pending", "processing", "packed", "shipped", "delivered", "cancelled", "returned"];

export async function GET(req: NextRequest) {
  // Every other admin route independently re-checks auth as defense in
  // depth, on top of middleware.ts's own gate — this one was missing it.
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  if (!hasAccess(session.role, "orders_read")) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const rawPaymentStatus = searchParams.get("paymentStatus");
  const rawOrderStatus = searchParams.get("orderStatus");
  const { orders, total } = await listOrders({
    paymentStatus: PAYMENT_STATUSES.find((s) => s === rawPaymentStatus),
    orderStatus: ORDER_STATUSES.find((s) => s === rawOrderStatus),
    search: searchParams.get("search") || undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
  });
  return NextResponse.json({ ok: true, orders, total });
}
