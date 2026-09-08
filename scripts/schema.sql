-- Orders schema for the books checkout (Razorpay + Shiprocket).
-- Run this once against the dedicated MySQL database created for this app
-- (see .env.example for the DB_* connection vars this expects).

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  razorpay_order_id VARCHAR(64) NOT NULL UNIQUE,
  razorpay_payment_id VARCHAR(64) NULL,
  status ENUM('created', 'paid', 'failed', 'shipped', 'cancelled', 'refunded') NOT NULL DEFAULT 'created',

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
  awb_code VARCHAR(64) NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  book_slug VARCHAR(120) NOT NULL,
  book_title VARCHAR(200) NOT NULL,
  variant_format VARCHAR(60) NOT NULL,
  unit_price_paise INT NOT NULL,
  quantity INT NOT NULL,
  weight_grams INT NOT NULL,
  length_cm INT NOT NULL,
  breadth_cm INT NOT NULL,
  height_cm INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
