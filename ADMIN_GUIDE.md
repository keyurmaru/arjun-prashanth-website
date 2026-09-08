# Admin Panel Guide

Covers what's actually built: authentication + RBAC, the Films and Books
CMS (with a Featured system), and Order management. Editing, screenwriting,
press, gallery, homepage sections, navigation, and SEO settings are **not**
in this admin panel yet — they're still plain content files under
`src/content/` and `src/app/`, edited by a developer. See "What's not in
this pass" at the bottom.

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

| Role | Films | Books | Orders | Users | Settings |
|---|---|---|---|---|---|
| `SUPER_ADMIN` | full | full | full | full | full |
| `CONTENT_MANAGER` | full | full | — | — | — |
| `ORDER_MANAGER` | — | — | full | — | — |
| `VIEWER` | — | — | read-only | — | — |

Enforced in `src/middleware.ts` (route-level) and again inside the order
PATCH handler (`src/app/api/admin/orders/[id]/route.ts`) since `VIEWER` can
reach the orders pages to read but must not be able to update them.

Manage accounts at `/admin/users` (SUPER_ADMIN only) — create, disable, or
re-enable. You can't change your own role/status from the UI (a safeguard
against accidentally locking yourself out).

## Films

`/admin/films` — list, create, edit. Each film has:

- **Project Type**: `Feature Film` / `Short Film` / `Direction` /
  `Associate Direction` / `Assistant Direction` / `Editing` — a
  categorisation field, separate from the exact credit wording.
- **Official Role**: the *exact* on-screen/official credit (e.g.
  "Associate Director & Screenwriting Contribution"). Never converted to
  "Director" automatically — if the real on-screen credit differs from
  what's entered here, update this field to match it, don't infer.
- **Status**: `DRAFT` (never public) → `PUBLISHED` → `ARCHIVED` (removed
  from the public site, kept in the database).
- **Featured** (see below) — a checkbox plus an order number.
- **Poster image**: a path/URL, same pattern as book covers — no upload UI
  yet.

## Featured System

Any published film can be marked **Featured**, with a **Featured Order**
(lower number shows first). The homepage's "Featured Film Credits" section
and the top of `/films` both read from this — change it in the admin, the
public site updates immediately, no code or deploy needed
(`getFeaturedFilmsPublic()` in `src/lib/filmsRepo.ts`).

If nothing is explicitly featured, the homepage falls back to the most
recently published films rather than showing an empty section — so an
admin who hasn't set featured items yet doesn't end up with a broken-looking
homepage. Explicitly featuring even one film turns that fallback off for
that section.

This same `featured` / `featured_order` pattern is meant to extend to
Editing, Screenwriting, Press, and Gallery once those become CMS-backed —
not built for them yet (see "What's not in this pass").

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
  or `cancelled` / `returned` — always manual, yours to control.
- **Shipping (Shiprocket)**: a dedicated panel on the order page with one
  button per step — Create Shipment, Assign AWB, Request Pickup, Generate
  Label, Generate Invoice, Refresh Tracking — each only shown when valid
  for the shipment's current state. Successful payment already
  auto-creates the Shiprocket order; if that step fails, the order stays
  `PAID` untouched and the panel shows **Retry Shipment**. Once Shiprocket
  sends tracking webhooks (configured below), status/label/invoice/AWB
  update automatically — the manual "AWB (manual override)" field further
  down is only for shipments booked outside Shiprocket entirely.
- **Internal notes** — free text, staff-only.

### Shiprocket webhook (one-time setup)

In Shiprocket → Settings → API → Webhooks, add:
- URL: `https://arjunprashanth.com/api/webhooks/shiprocket`
- Header/token: the value of `SHIPROCKET_WEBHOOK_SECRET` (sent back as
  `x-api-key` and verified server-side)

Once configured, shipment status flows back automatically and the
customer gets a "shipped" email (with AWB/tracking) on the first transit
event, and a "delivered" email when Shiprocket reports delivery — both
guarded against duplicate webhook deliveries, so retries never send twice.

Payment status (`pending/paid/failed/refunded/partially_refunded`) is
driven by Razorpay, not editable here — it's set by the webhook
(`/api/webhooks/razorpay`) or the client-side verify call, whichever lands
first, and is idempotent (a duplicate webhook delivery can't double-charge
stock or send duplicate emails — see `src/lib/fulfillOrder.ts`).

## Settings

`/admin/settings/shipping` (SUPER_ADMIN only) — shows whether Shiprocket
credentials, the pickup location, and the webhook secret are configured,
plus a **Test Connection** button that verifies the credentials work
without ever displaying them.

## Database setup (one-time)

1. Create a dedicated MySQL database + user via hPanel — don't reuse the
   WordPress one.
2. Set `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD` (see
   `.env.example`) wherever the app reads its runtime env from.
3. Run the schema: `mysql -h <host> -u <user> -p <db> < scripts/schema.sql`
   (idempotent — safe to re-run).
4. Seed the verified catalogue: `node scripts/seed-books.mjs` and
   `node scripts/seed-films.mjs` (both skip any slug that already exists).
5. Create your first admin: `node scripts/seed-admin.mjs ...` (above).

## What's not in this pass

Films + Books are now full CMS with a Featured system; everything else
described in the original requirements docs is still scoped for later
passes. Still on plain content files, not database-backed or
admin-editable:

- Editing, screenwriting, author page copy, press, gallery, homepage
  section configuration (enable/disable, headings, item limits — the
  homepage layout itself is fixed code, only its featured film/book
  *content* is admin-controlled), navigation, site-wide SEO settings.
- The Featured system exists only for Films and (implicitly, via
  `getPublishedBooksPublic`) Books' publish status — Books don't have an
  explicit `featured` flag yet, they all show on `/books`.
- Per-record SEO fields exist for Films (`seoTitle`/`seoDescription`) but
  not yet Books; no SEO health dashboard, image-SEO metadata, redirect
  management, or social-preview UI anywhere.
- A media upload library — cover images are pasted as a path/URL today.
- Content workflow (scheduled publishing) — books only have the status
  enum above, no "publish at a future date" scheduling.
- Audit log UI — actions are recorded in the `audit_log` table
  (`src/lib/auditLog.ts`) but there's no admin page to browse it yet.
- Serviceability/rate check at checkout (`checkServiceability` exists in
  `src/lib/shiprocket.ts` but isn't called from the checkout flow —
  shipping is a flat rate today, see `src/app/api/orders/create/route.ts`).
- Courier selection — `Assign AWB` lets Shiprocket pick the courier; there's
  no UI to choose a specific one from `checkServiceability`'s results.
