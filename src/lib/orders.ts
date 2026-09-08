import { getPool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
export type OrderStatus = "pending" | "processing" | "packed" | "shipped" | "delivered" | "cancelled" | "returned";
export type ShippingStatus = "not_shipped" | "label_created" | "shipped" | "delivered";

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface ResolvedOrderItem {
  variantId: number;
  bookSlug: string;
  bookTitle: string;
  variantFormat: string;
  unitPricePaise: number;
  quantity: number;
  weightGrams: number;
  dimensionsCm: { length: number; breadth: number; height: number };
  signed: boolean;
  personalisationMessage?: string;
}

export interface OrderRecord {
  id: number;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingStatus: ShippingStatus;
  address: ShippingAddress;
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  currency: string;
  shiprocketOrderId: string | null;
  shiprocketShipmentId: string | null;
  awbCode: string | null;
  trackingUrl: string | null;
  adminNotes: string | null;
  createdAt: string;
  items: ResolvedOrderItem[];
}

export interface OrderListFilters {
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  search?: string; // matches customer name, email, or order id
  page?: number;
  pageSize?: number;
}

export async function createOrder(params: {
  razorpayOrderId: string;
  address: ShippingAddress;
  items: ResolvedOrderItem[];
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
}): Promise<number> {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO orders
        (razorpay_order_id, payment_status, customer_name, email, phone, address_line1, address_line2,
         city, state, pincode, country, subtotal_paise, shipping_paise, total_paise, currency)
       VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR')`,
      [
        params.razorpayOrderId,
        params.address.name,
        params.address.email,
        params.address.phone,
        params.address.line1,
        params.address.line2 || null,
        params.address.city,
        params.address.state,
        params.address.pincode,
        params.address.country,
        params.subtotalPaise,
        params.shippingPaise,
        params.totalPaise,
      ],
    );
    const orderId = result.insertId;

    for (const item of params.items) {
      await conn.execute(
        `INSERT INTO order_items
          (order_id, variant_id, book_slug, book_title, variant_format, unit_price_paise, quantity,
           weight_grams, length_cm, breadth_cm, height_cm, signed, personalisation_message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.variantId,
          item.bookSlug,
          item.bookTitle,
          item.variantFormat,
          item.unitPricePaise,
          item.quantity,
          item.weightGrams,
          item.dimensionsCm.length,
          item.dimensionsCm.breadth,
          item.dimensionsCm.height,
          item.signed ? 1 : 0,
          item.personalisationMessage || null,
        ],
      );
    }

    await conn.commit();
    return orderId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Idempotent: only transitions pending -> paid. Returns true the first
 * time it's called for a given order (client-side verify and the webhook
 * can both race to call this for the same payment) — callers use this to
 * gate one-time-only side effects (stock deduction, Shiprocket, emails). */
export async function markOrderPaid(razorpayOrderId: string, razorpayPaymentId: string): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE orders SET payment_status = 'paid', razorpay_payment_id = ?
     WHERE razorpay_order_id = ? AND payment_status = 'pending'`,
    [razorpayPaymentId, razorpayOrderId],
  );
  return result.affectedRows > 0;
}

/** Idempotent the same way as markOrderPaid — only transitions pending -> failed. */
export async function markOrderFailed(razorpayOrderId: string): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE orders SET payment_status = 'failed'
     WHERE razorpay_order_id = ? AND payment_status = 'pending'`,
    [razorpayOrderId],
  );
  return result.affectedRows > 0;
}

export async function recordShiprocketDetails(
  razorpayOrderId: string,
  details: { shiprocketOrderId: string; shipmentId: string; awbCode?: string },
): Promise<void> {
  const pool = getPool();
  await pool.execute(
    `UPDATE orders SET shiprocket_order_id = ?, shiprocket_shipment_id = ?, awb_code = ?, shipping_status = 'label_created'
     WHERE razorpay_order_id = ?`,
    [details.shiprocketOrderId, details.shipmentId, details.awbCode || null, razorpayOrderId],
  );
}

export async function updateOrderAdminFields(
  id: number,
  fields: Partial<{
    orderStatus: OrderStatus;
    shippingStatus: ShippingStatus;
    paymentStatus: PaymentStatus;
    trackingUrl: string;
    awbCode: string;
    adminNotes: string;
  }>,
): Promise<void> {
  const columns: string[] = [];
  const values: (string | number)[] = [];
  if (fields.orderStatus) {
    columns.push("order_status = ?");
    values.push(fields.orderStatus);
  }
  if (fields.shippingStatus) {
    columns.push("shipping_status = ?");
    values.push(fields.shippingStatus);
  }
  if (fields.paymentStatus) {
    columns.push("payment_status = ?");
    values.push(fields.paymentStatus);
  }
  if (fields.trackingUrl !== undefined) {
    columns.push("tracking_url = ?");
    values.push(fields.trackingUrl);
  }
  if (fields.awbCode !== undefined) {
    columns.push("awb_code = ?");
    values.push(fields.awbCode);
  }
  if (fields.adminNotes !== undefined) {
    columns.push("admin_notes = ?");
    values.push(fields.adminNotes);
  }
  if (columns.length === 0) return;

  const pool = getPool();
  await pool.execute(`UPDATE orders SET ${columns.join(", ")} WHERE id = ?`, [...values, id]);
}

export async function getOrderByRazorpayOrderId(razorpayOrderId: string): Promise<OrderRecord | null> {
  const pool = getPool();
  const [orderRows] = await pool.execute<RowDataPacket[]>(`SELECT * FROM orders WHERE razorpay_order_id = ?`, [
    razorpayOrderId,
  ]);
  return orderRows[0] ? hydrateOrder(orderRows[0]) : null;
}

export async function getOrderById(id: number): Promise<OrderRecord | null> {
  const pool = getPool();
  const [orderRows] = await pool.execute<RowDataPacket[]>(`SELECT * FROM orders WHERE id = ?`, [id]);
  return orderRows[0] ? hydrateOrder(orderRows[0]) : null;
}

export async function listOrders(filters: OrderListFilters): Promise<{ orders: OrderRecord[]; total: number }> {
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize || 25));
  const where: string[] = [];
  const values: (string | number)[] = [];

  if (filters.paymentStatus) {
    where.push("payment_status = ?");
    values.push(filters.paymentStatus);
  }
  if (filters.orderStatus) {
    where.push("order_status = ?");
    values.push(filters.orderStatus);
  }
  if (filters.search) {
    where.push("(customer_name LIKE ? OR email LIKE ? OR id = ?)");
    const like = `%${filters.search}%`;
    values.push(like, like, Number(filters.search) || 0);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const pool = getPool();

  const [countRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM orders ${whereSql}`,
    values,
  );
  const total = countRows[0]?.total ?? 0;

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM orders ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, pageSize, (page - 1) * pageSize],
  );

  const orders = await Promise.all(rows.map((r) => hydrateOrder(r)));
  return { orders, total };
}

export interface DashboardStats {
  todayOrders: number;
  pendingPayments: number;
  paidOrders: number;
  failedPayments: number;
  revenuePaise: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_orders,
      SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_payments,
      SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
      SUM(CASE WHEN payment_status = 'failed' THEN 1 ELSE 0 END) as failed_payments,
      SUM(CASE WHEN payment_status = 'paid' THEN total_paise ELSE 0 END) as revenue_paise
     FROM orders`,
  );
  const r = rows[0] || {};
  return {
    todayOrders: Number(r.today_orders || 0),
    pendingPayments: Number(r.pending_payments || 0),
    paidOrders: Number(r.paid_orders || 0),
    failedPayments: Number(r.failed_payments || 0),
    revenuePaise: Number(r.revenue_paise || 0),
  };
}

async function hydrateOrder(row: RowDataPacket): Promise<OrderRecord> {
  const pool = getPool();
  const [itemRows] = await pool.execute<RowDataPacket[]>(`SELECT * FROM order_items WHERE order_id = ?`, [row.id]);

  return {
    id: row.id,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    shippingStatus: row.shipping_status,
    address: {
      name: row.customer_name,
      email: row.email,
      phone: row.phone,
      line1: row.address_line1,
      line2: row.address_line2 || undefined,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      country: row.country,
    },
    subtotalPaise: row.subtotal_paise,
    shippingPaise: row.shipping_paise,
    totalPaise: row.total_paise,
    currency: row.currency,
    shiprocketOrderId: row.shiprocket_order_id,
    shiprocketShipmentId: row.shiprocket_shipment_id,
    awbCode: row.awb_code,
    trackingUrl: row.tracking_url,
    adminNotes: row.admin_notes,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    items: itemRows.map((r) => ({
      variantId: r.variant_id,
      bookSlug: r.book_slug,
      bookTitle: r.book_title,
      variantFormat: r.variant_format,
      unitPricePaise: r.unit_price_paise,
      quantity: r.quantity,
      weightGrams: r.weight_grams,
      dimensionsCm: { length: r.length_cm, breadth: r.breadth_cm, height: r.height_cm },
      signed: !!r.signed,
      personalisationMessage: r.personalisation_message || undefined,
    })),
  };
}
