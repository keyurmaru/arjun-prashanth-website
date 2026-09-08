import { getPool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

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
  bookSlug: string;
  bookTitle: string;
  variantFormat: string;
  unitPricePaise: number;
  quantity: number;
  weightGrams: number;
  dimensionsCm: { length: number; breadth: number; height: number };
}

export interface OrderRecord {
  id: number;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  status: "created" | "paid" | "failed" | "shipped" | "cancelled" | "refunded";
  address: ShippingAddress;
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  currency: string;
  items: ResolvedOrderItem[];
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
        (razorpay_order_id, status, customer_name, email, phone, address_line1, address_line2,
         city, state, pincode, country, subtotal_paise, shipping_paise, total_paise, currency)
       VALUES (?, 'created', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR')`,
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
          (order_id, book_slug, book_title, variant_format, unit_price_paise, quantity,
           weight_grams, length_cm, breadth_cm, height_cm)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.bookSlug,
          item.bookTitle,
          item.variantFormat,
          item.unitPricePaise,
          item.quantity,
          item.weightGrams,
          item.dimensionsCm.length,
          item.dimensionsCm.breadth,
          item.dimensionsCm.height,
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

/** Idempotent: only transitions 'created' -> 'paid'. Returns true the first
 * time it's called for a given order (client-side verify and the webhook
 * can both race to call this for the same payment). */
export async function markOrderPaid(razorpayOrderId: string, razorpayPaymentId: string): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE orders SET status = 'paid', razorpay_payment_id = ?
     WHERE razorpay_order_id = ? AND status = 'created'`,
    [razorpayPaymentId, razorpayOrderId],
  );
  return result.affectedRows > 0;
}

export async function recordShiprocketDetails(
  razorpayOrderId: string,
  details: { shiprocketOrderId: string; shipmentId: string; awbCode?: string },
): Promise<void> {
  const pool = getPool();
  await pool.execute(
    `UPDATE orders SET shiprocket_order_id = ?, shiprocket_shipment_id = ?, awb_code = ?
     WHERE razorpay_order_id = ?`,
    [details.shiprocketOrderId, details.shipmentId, details.awbCode || null, razorpayOrderId],
  );
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

async function hydrateOrder(row: RowDataPacket): Promise<OrderRecord> {
  const pool = getPool();
  const [itemRows] = await pool.execute<RowDataPacket[]>(`SELECT * FROM order_items WHERE order_id = ?`, [row.id]);

  return {
    id: row.id,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    status: row.status,
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
    items: itemRows.map((r) => ({
      bookSlug: r.book_slug,
      bookTitle: r.book_title,
      variantFormat: r.variant_format,
      unitPricePaise: r.unit_price_paise,
      quantity: r.quantity,
      weightGrams: r.weight_grams,
      dimensionsCm: { length: r.length_cm, breadth: r.breadth_cm, height: r.height_cm },
    })),
  };
}
