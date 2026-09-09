# Admin Panel Guide

Covers what's actually built: authentication + RBAC, the Films and Books
CMS (with a Featured system), a central Media Library, and Order
management. Editing, screenwriting, press, gallery, homepage sections,
navigation, and SEO settings are **not** in this admin panel yet — they're
still plain content files under `src/content/` and `src/app/`, edited by a
developer. See "What's not in this pass" at the bottom.

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

| Role | Films | Books | Media | Orders | Users | Settings |
|---|---|---|---|---|---|---|
| `SUPER_ADMIN` | full | full | full | full | full | full |
| `CONTENT_MANAGER` | full | full | full | — | — | — |
| `ORDER_MANAGER` | — | — | — | full | — | — |
| `VIEWER` | — | — | — | read-only | — | — |

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
- **Card image or video**: what's shown on Films-page and homepage cards —
  click "Select / Upload" to drag-and-drop a file or pick one already in
  the Media Library (see below). This can be a **video** (MP4/WebM) as
  well as an image: a video plays silently on loop, cropped to exactly the
  same card size as an image would be, so mixing the two across the grid
  never changes the layout. Social-preview (Open Graph) images can't be
  video, so a film with a video card falls back to its first gallery still
  for link previews. A raw path/URL still works if you'd rather paste one.
- **Gallery**: any number of additional images (stills/BTS) for the
  detail page only, each with an optional caption. Add/remove freely.
- **Videos**: any number of clips (Trailer/Teaser/Showreel/Behind the
  Scenes/Interview/Official Video/Clip), each with an optional title. For
  the URL, either paste a YouTube or Vimeo link, or click "Upload" to
  upload an MP4/WebM file directly (stored in the Media Library, played
  back with a plain HTML5 `<video>` tag rather than embedded) — optionally
  set a poster image for it too. Editing a film replaces its gallery/video
  lists wholesale, same as book variants.

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

## Media Library

`/admin/media` — every uploaded image and video in one place, reusable
across Films and Books rather than re-uploading the same asset per record.

- **Upload**: drag-and-drop or click to select, one or many files at once.
  Each file uploads and shows its own progress/status independently, so
  one failure (wrong format, too large) never blocks the rest of the
  batch — failed files show a **Retry** button. Supported: JPEG, PNG, GIF,
  WebP (up to 15MB), and MP4/WebM (up to 300MB). The real file bytes are
  sniffed server-side to confirm the type — a renamed `.exe` claiming to
  be a `.jpg` is rejected regardless of its filename.
- **Search & filter**: by filename, title, alt text, caption, tag, or
  project; filter by type (image/video) or status.
- **Click any item** to open its detail panel: title, alt text (for
  accessibility — write what's actually shown, not keyword-stuffed),
  caption, description, SEO title/description, keywords, credit, rights
  owner/status, category, project, tags, featured flag, and status
  (Draft/Approved/Archived). Save without leaving the panel.
- **Used In**: the detail panel lists every film/book card image, gallery
  entry, or video/poster currently pointing at that file, computed live
  from the content tables (not a separately-maintained index) — so you can
  see before deleting whether something depends on it.
- **Delete**: blocked with a "used in N places" warning if anything still
  references the file; confirming again forces the delete anyway. Prefer
  setting status to **Archived** over deleting when in doubt — archived
  media is hidden from the picker used in Film/Book forms but stays in the
  library and on disk.
- **Select multiple → Bulk edit**: apply a shared category/project/
  tags/rights status/status across a selected batch in one action — alt
  text and other per-item fields still have to be set individually, since
  they're meant to describe one specific image.
- Every Film/Book form field that used to be a plain image-URL text box
  (card image, gallery rows, cover, video URL/poster) now opens this same
  upload-or-pick control instead — pasting a raw path/URL still works if
  you already have one.
- **Optimization**: uploaded images are automatically served as resized
  WebP derivatives on the public site (via Next.js's built-in image
  optimizer) — you don't need to pre-resize anything before uploading.
  There's no server-side video transcoding (this host has no ffmpeg
  installed), so upload web-ready MP4/H.264 files directly; large/exotic
  formats should be converted before uploading.

### Public Gallery — every upload appears automatically

The public [/gallery](https://arjunprashanth.com/gallery) page reads
directly from the Media Library: **every image you upload — anywhere** (a
film's card/gallery, a book's cover/gallery, or a plain upload straight
into `/admin/media` for something that doesn't belong to a specific film or
book, like an event photo) — shows up there automatically. There's no
separate "publish to gallery" step; a new upload defaults to `APPROVED`,
and only `APPROVED` images are shown publicly.

- **Caption**: whatever you type in an image's **Caption** field (Media
  Library → click the image → Caption) appears on the public Gallery page —
  as a hover overlay on the grid, and above the image counter when it's
  opened full-size. Leave it blank and the image still shows, just without
  caption text — nothing is invented on your behalf.
- **To keep something out of the Gallery**: set its status to `DRAFT` or
  `ARCHIVED` in the Media Library. Everything else `APPROVED` is public,
  including images already attached to a film or book — the same photo can
  be both a film's poster *and* appear in the general Gallery.
- **Featured images** (the same `featured`/`featured_order` fields used
  elsewhere) sort first in the Gallery, so you can pin specific shots to
  the top without reordering everything else.
- Tag an upload's **Category** field (e.g. "Film", "Event", "Press") if
  you want to keep your own mental grouping — the Gallery page itself
  doesn't filter by it yet, but the data's there for later.
- The original 54 production stills that were on the Gallery page before
  this were real, previously-verified photography kept exactly as they
  were (`src/content/gallery.ts`) — they still show, appended after
  whatever's in the Media Library.

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
- **Cover image**: click "Select / Upload" to upload a file or pick one
  from the Media Library — a raw path/URL still works if you paste one.
- **Gallery**: any number of additional images (mockups, alternate covers)
  shown on the book's detail page, each with an optional caption.

Archiving a book (the "Archive" action, not a hard delete) sets its status
to `ARCHIVED`; it disappears from `/books` and `/books/[slug]` immediately
but its row and order history stay intact.

## Orders

`/admin/orders` — search by name/email/order number, filter by payment or
order status, paginated. Each order detail page (`/admin/orders/[id]`)
shows the full customer record (name, email, phone, address), every item
(with SKU/signed/personalisation flags), the Razorpay payment method
(card/UPI/netbanking/wallet/emi) and — if the payment failed — the reason
Razorpay reported, and lets `SUPER_ADMIN`/`ORDER_MANAGER` update:

- **Mark Fulfilled / Cancel Order** — one-click buttons at the top of the
  order page. Fulfilled sets order status to `delivered`. Cancel sets it to
  `cancelled` and, if the order had already been paid (stock was
  deducted), restores that stock — it does **not** trigger a Razorpay
  refund, which stays a deliberate separate action in the Razorpay
  dashboard.
- **Order status**: `pending → processing → packed → shipped → delivered`,
  or `cancelled` / `returned` — always manual, yours to control (the two
  buttons above are shortcuts into this same field).
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

Films + Books are now full CMS with a Featured system, and there's a
central Media Library — the public Gallery page also now pulls from it
automatically (see above), so it's no longer purely static either. Still
scoped for later passes. Still on plain content files, not database-backed
or admin-editable:

- Editing, screenwriting, author page copy, press, homepage section
  configuration (enable/disable, headings, item limits — the homepage
  layout itself is fixed code, only its featured film/book *content* is
  admin-controlled), navigation, site-wide SEO settings. There's no
  admin UI for the Gallery page's heading/description copy or for
  reordering beyond the featured flag — only its *images* are dynamic.
- The Featured system exists only for Films and (implicitly, via
  `getPublishedBooksPublic`) Books' publish status — Books don't have an
  explicit `featured` flag yet, they all show on `/books`.
- Per-record SEO fields exist for Films (`seoTitle`/`seoDescription`) but
  not yet Books; no SEO health dashboard, redirect management, or
  social-preview UI anywhere (the Media Library does have per-image SEO
  title/description/keywords fields).
- Content workflow (scheduled publishing) — books only have the status
  enum above, no "publish at a future date" scheduling.
- Audit log UI — actions (including every upload/edit/delete in the Media
  Library) are recorded in the `audit_log` table (`src/lib/auditLog.ts`)
  but there's no admin page to browse it yet.
- Serviceability/rate check at checkout (`checkServiceability` exists in
  `src/lib/shiprocket.ts` but isn't called from the checkout flow —
  shipping is a flat rate today, see `src/app/api/orders/create/route.ts`).
- Courier selection — `Assign AWB` lets Shiprocket pick the courier; there's
  no UI to choose a specific one from `checkServiceability`'s results.
- Media Library extras deliberately left out as optional per the spec:
  AI-suggested alt text/title/keywords (never auto-published even where
  it exists elsewhere), a focal-point/crop selector, AVIF derivatives
  (WebP only for now), drag-to-reorder in the picker grid (remove + re-add
  reorders instead), and resumable/chunked upload for very large video
  files (a single upload request handles up to 300MB, which is generous
  for a personal site — true resumable upload would only matter well
  beyond that).
- No server-side video transcoding/poster-frame extraction — this
  shared-hosting account has no ffmpeg installed. Uploaded video is stored
  and served exactly as uploaded, so it should already be web-ready
  MP4/H.264; a poster image can be set manually per video.
- The Media Library's "Used In" list is computed live by searching the
  content tables for the file's URL, not a maintained relational index —
  correct and sufficient at this library's size, but would be worth
  revisiting if the library grows very large.
