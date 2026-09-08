-- One-time migration: expand the orders table for the full Shiprocket
-- integration (AWB, courier, label/invoice, tracking timestamps). Already
-- applied directly to production; kept here so schema.sql (fresh installs)
-- and the live DB stay in sync and this history is visible in git.

ALTER TABLE orders
  MODIFY COLUMN shipping_status ENUM(
    'not_shipped', 'shipment_created', 'awb_assigned', 'pickup_requested', 'picked_up',
    'in_transit', 'out_for_delivery', 'delivered', 'rto', 'cancelled', 'failed'
  ) NOT NULL DEFAULT 'not_shipped',
  ADD COLUMN courier_name VARCHAR(100) NULL AFTER shiprocket_shipment_id,
  ADD COLUMN courier_id VARCHAR(32) NULL AFTER courier_name,
  ADD COLUMN shipping_label_url VARCHAR(500) NULL AFTER awb_code,
  ADD COLUMN invoice_url VARCHAR(500) NULL AFTER shipping_label_url,
  ADD COLUMN last_tracking_event VARCHAR(300) NULL AFTER tracking_url,
  ADD COLUMN shipment_created_at DATETIME NULL AFTER last_tracking_event,
  ADD COLUMN awb_assigned_at DATETIME NULL AFTER shipment_created_at,
  ADD COLUMN shipped_at DATETIME NULL AFTER awb_assigned_at,
  ADD COLUMN delivered_at DATETIME NULL AFTER shipped_at,
  ADD COLUMN last_tracking_sync_at DATETIME NULL AFTER delivered_at;

ALTER TABLE order_items
  ADD COLUMN sku VARCHAR(80) NULL AFTER variant_id;
