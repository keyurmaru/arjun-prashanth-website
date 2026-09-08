# Admin Panel Guide

Covers what's actually built: authentication + RBAC, the Books CMS, and
Order management. Films, press, gallery, homepage sections, navigation,
and SEO settings are **not** in this admin panel yet — they're still plain
content files under `src/content/` and `src/app/`, edited by a developer.
See "What's not in this pass" at the bottom.

## Logging in

`https://arjunprashanth.com/admin/login` — email + password. Sessions last
7 days (cookie `apr_admin_session`) and are checked on every `/admin` and
`/api/admin` request server-side (`src/middleware.ts`), not just hidden in
the UI.

The first account has to be created directly on the server (there's no
public sign-up, by design):

```bash
DB_HOST=127.0.0.1 DB_NAME=... DB_USER=... DB_PASSWORD=... \
  node scripts/seed-admin.mjs owner@example.com 'a-strong-password' 'Owner Name'
```

This is safe to re-run — it resets that email's password and guarantees
`SUPER_ADMIN` + active, rather than erroring on a duplicate. Use it if you
ever get locked out.

## Roles

| Role | Books | Orders | Users |
|---|---|---|---|
| `SUPER_ADMIN` | full | full | full |
| `CONTENT_MANAGER` | full | — | — |
| `ORDER_MANAGER` | — | full | — |
| `VIEWER` | — | read-only | — |

Enforced in `src/middleware.ts` (route-level) and again inside the order
PATCH handler (`src/app/api/admin/orders/[id]/route.ts`) since `VIEWER` can
reach the orders pages to read but must not be able to update them.

Manage accounts at `/admin/users` (SUPER_ADMIN only) — create, disable, or
re-enable. You can't change your own role/status from the UI (a safeguard
against accidentally locking yourself out).

## Books

`/admin/books` — list, create, edit. Each book has:

- **Status**: `DRAFT` (never public) → `COMING_SOON` / `PRE_ORDER` (shows a
  "Notify Me" email capture, no purchase button) → `PUBLISHED` (Add to
  Cart / Buy Now, gated further by per-variant stock) → `OUT_OF_STOCK`
  (Notify Me again) → `ARCHIVED` (removed from the public site, order
  history referencing it is untouched).
- **Variants** (Paperback/Hardcover/etc.): price, stock, low-stock alert
  threshold, and the weight/dimensions Shiprocket needs to book a
  shipment. Add/remove variants freely — editing a book replaces its
  variant list wholesale.
- **Signed copy / personalisation**: toggle on, set a character limit for
  the personalisation message. When on, the public book page shows the
  checkbox + textarea + a spelling-confirmation checkbox before the buyer
  can add it to cart; the message travels through cart → checkout → the
  order record → both confirmation emails, and appears in `/admin/orders`.
- **Cover image**: a path/URL, e.g. `/images/books/my-book.jpeg` (upload
  the file to `public/images/books/` yourself and reference it — there's
  no media upload UI yet, see limitations below).

Archiving a book (the "Archive" action, not a hard delete) sets its status
to `ARCHIVED`; it disappears from `/books` and `/books/[slug]` immediately
but its row and order history stay intact.

## Orders

`/admin/orders` — search by name/email/order number, filter by payment or
order status, paginated. Each order detail page (`/admin/orders/[id]`)
shows the customer, address, items (with signed/personalisation flags),
and lets `SUPER_ADMIN`/`ORDER_MANAGER` update:

- **Order status**: `pending → processing → packed → shipped → delivered`,
  or `cancelled` / `returned`.
- **Shipping status**, AWB/tracking number, tracking URL — set manually
  today. If you connect Shiprocket (see below), successful payments
  already create the Shiprocket order automatically and store its id, but
  there's no Shiprocket *webhook* listener yet, so shipment status updates
  don't flow back in on their own — update them here as you ship.
- **Internal notes** — free text, staff-only.

Payment status (`pending/paid/failed/refunded/partially_refunded`) is
driven by Razorpay, not editable here — it's set by the webhook
(`/api/webhooks/razorpay`) or the client-side verify call, whichever lands
first, and is idempotent (a duplicate webhook delivery can't double-charge
stock or send duplicate emails — see `src/lib/fulfillOrder.ts`).

## Database setup (one-time)

1. Create a dedicated MySQL database + user via hPanel — don't reuse the
   WordPress one.
2. Set `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD` (see
   `.env.example`) wherever the app reads its runtime env from.
3. Run the schema: `mysql -h <host> -u <user> -p <db> < scripts/schema.sql`
   (idempotent — safe to re-run).
4. Seed the verified book catalogue: `node scripts/seed-books.mjs` (skips
   any slug that already exists).
5. Create your first admin: `node scripts/seed-admin.mjs ...` (above).

## What's not in this pass

This was scoped as an MVP (books + orders admin only) rather than the full
CMS described in the original requirements doc. Still on plain content
files, not database-backed or admin-editable:

- Films, editing, screenwriting, author page copy, press, gallery,
  homepage sections, navigation, site-wide SEO settings.
- A media upload library — cover images are pasted as a path/URL today.
- Content workflow (scheduled publishing) — books only have the status
  enum above, no "publish at a future date" scheduling.
- Audit log UI — actions are recorded in the `audit_log` table
  (`src/lib/auditLog.ts`) but there's no admin page to browse it yet.
- A Shiprocket webhook listener to pull shipment status back automatically.
