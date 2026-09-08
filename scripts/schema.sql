-- Schema for the books CMS + admin + checkout (Razorpay + Shiprocket).
-- Run this once against the dedicated MySQL database created for this app
-- (see .env.example for the DB_* connection vars this expects).
-- Safe to re-run: every statement is idempotent (CREATE ... IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(200) NOT NULL,
  name VARCHAR(120) NOT NULL,
  role ENUM('SUPER_ADMIN', 'CONTENT_MANAGER', 'ORDER_MANAGER', 'VIEWER') NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  status ENUM('DRAFT', 'COMING_SOON', 'PRE_ORDER', 'PUBLISHED', 'OUT_OF_STOCK', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  cover VARCHAR(300) NOT NULL,
  excerpt TEXT NOT NULL,
  description_json JSON NOT NULL,
  discover_json JSON NULL,
  signed_copy_available TINYINT(1) NOT NULL DEFAULT 0,
  personalisation_available TINYINT(1) NOT NULL DEFAULT 0,
  personalisation_char_limit INT NOT NULL DEFAULT 200,
  sort_order INT NOT NULL DEFAULT 0,
  seo_title VARCHAR(200) NULL,
  seo_description VARCHAR(300) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS book_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  format VARCHAR(60) NOT NULL,
  sku VARCHAR(80) NULL,
  price_inr INT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  weight_grams INT NOT NULL,
  length_cm INT NOT NULL,
  breadth_cm INT NOT NULL,
  height_cm INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_book_format (book_id, format)
);

CREATE TABLE IF NOT EXISTS films (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  project_type ENUM('Feature Film', 'Short Film', 'Direction', 'Associate Direction', 'Assistant Direction', 'Editing') NOT NULL,
  -- Exact on-screen/official credit wording — never auto-converted to
  -- "Director" from Assistant/Associate Direction.
  official_role VARCHAR(150) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  language VARCHAR(60) NOT NULL,
  year VARCHAR(20) NULL,
  credits TEXT NOT NULL,
  synopsis TEXT NULL,
  trailer_url VARCHAR(300) NULL,
  poster_url VARCHAR(300) NULL,
  status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  featured_order INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  seo_title VARCHAR(200) NULL,
  seo_description VARCHAR(300) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  razorpay_order_id VARCHAR(64) NOT NULL UNIQUE,
  razorpay_payment_id VARCHAR(64) NULL,

  -- Kept as three independent tracks rather than one status field, since a
  -- shipped order can still be refunded, a paid order can still be pending
  -- dispatch, etc.
  payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') NOT NULL DEFAULT 'pending',
  order_status ENUM('pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned') NOT NULL DEFAULT 'pending',
  -- Mirrors Shiprocket's own lifecycle so webhook events map onto it
  -- directly; 'failed' is ours (Shiprocket order-creation failed — the
  -- payment stays untouched, this is purely a fulfilment-retry signal).
  shipping_status ENUM(
    'not_shipped', 'shipment_created', 'awb_assigned', 'pickup_requested', 'picked_up',
    'in_transit', 'out_for_delivery', 'delivered', 'rto', 'cancelled', 'failed'
  ) NOT NULL DEFAULT 'not_shipped',

  customer_name VARCHAR(120) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(200) NOT NULL,
  address_line2 VARCHAR(200) NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(12) NOT NULL,
  country VARCHAR(60) NOT NULL DEFAULT 'India',

  subtotal_paise INT NOT NULL,
  shipping_paise INT NOT NULL DEFAULT 0,
  total_paise INT NOT NULL,
  currency VARCHAR(6) NOT NULL DEFAULT 'INR',

  shiprocket_order_id VARCHAR(64) NULL,
  shiprocket_shipment_id VARCHAR(64) NULL,
  courier_name VARCHAR(100) NULL,
  courier_id VARCHAR(32) NULL,
  awb_code VARCHAR(64) NULL,
  shipping_label_url VARCHAR(500) NULL,
  invoice_url VARCHAR(500) NULL,
  tracking_url VARCHAR(300) NULL,
  last_tracking_event VARCHAR(300) NULL,
  shipment_created_at DATETIME NULL,
  awb_assigned_at DATETIME NULL,
  shipped_at DATETIME NULL,
  delivered_at DATETIME NULL,
  last_tracking_sync_at DATETIME NULL,

  admin_notes TEXT NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  variant_id INT NULL,
  sku VARCHAR(80) NULL,
  book_slug VARCHAR(120) NOT NULL,
  book_title VARCHAR(200) NOT NULL,
  variant_format VARCHAR(60) NOT NULL,
  unit_price_paise INT NOT NULL,
  quantity INT NOT NULL,
  weight_grams INT NOT NULL,
  length_cm INT NOT NULL,
  breadth_cm INT NOT NULL,
  height_cm INT NOT NULL,
  signed TINYINT(1) NOT NULL DEFAULT 0,
  personalisation_message VARCHAR(500) NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES book_variants(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notify_me (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  email VARCHAR(200) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_user_id INT NULL,
  admin_email VARCHAR(200) NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(60) NOT NULL,
  entity_id VARCHAR(60) NOT NULL,
  details_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
);
