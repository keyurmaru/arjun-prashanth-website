import { NextRequest, NextResponse } from "next/server";
import { listOrders, type PaymentStatus, type OrderStatus } from "@/lib/orders";

const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded", "partially_refunded"];
const ORDER_STATUSES: OrderStatus[] = ["pending", "processing", "packed", "shipped", "delivered", "cancelled", "returned"];

export async function GET(req: NextRequest) {
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
