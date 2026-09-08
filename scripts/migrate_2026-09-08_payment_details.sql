-- One-time migration: capture the Razorpay payment method (card/upi/...)
-- and, for failed payments, the failure reason — both previously
-- discarded. Already applied directly to production; kept here so
-- schema.sql (fresh installs) and the live DB stay in sync.

ALTER TABLE orders
  ADD COLUMN payment_method VARCHAR(30) NULL AFTER razorpay_payment_id,
  ADD COLUMN failure_reason VARCHAR(500) NULL AFTER payment_method;
