-- Optional per-account TOTP two-factor auth for the admin panel. Opt-in
-- (totp_enabled defaults to 0) so existing sessions/accounts are untouched
-- until an admin deliberately turns it on for themselves.
ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(64) NULL AFTER password_hash,
  ADD COLUMN IF NOT EXISTS totp_enabled TINYINT(1) NOT NULL DEFAULT 0 AFTER totp_secret;

-- Single-use recovery codes for when the authenticator device is lost.
-- Stored bcrypt-hashed, same as the account password — never plaintext.
CREATE TABLE IF NOT EXISTS admin_totp_backup_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_user_id INT NOT NULL,
  code_hash VARCHAR(200) NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);
