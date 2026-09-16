-- Customer accounts: auto-created the moment an order is paid (see
-- fulfillOrder.ts), with a random password emailed directly to the
-- customer — lets them log in to see order status and order history
-- without a separate signup step.
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(200) NOT NULL,
  name VARCHAR(120) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_id INT NULL AFTER id;

-- Separate statement since MariaDB's ADD CONSTRAINT doesn't support IF NOT
-- EXISTS — this migration is meant to run once.
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
