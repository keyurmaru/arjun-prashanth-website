# Arjun Prashanth — Next.js site

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4. This is the real
production/staging source for arjunprashanth.com, deployed via Hostinger's
Node.js App pipeline from this directory (`hbuilds/source`).

## Project structure

- `src/app/` — routes (App Router). Each `page.tsx` exports its own
  `metadata` built via `src/lib/seo.ts`.
- `src/components/` — reusable UI (Header, Footer, cards, forms, etc).
- `src/content/` — structured content (films, books, nav, verified bio
  facts). Prose that's tightly coupled to one page's layout lives in that
  page component instead.
- `src/lib/` — validation (zod), email (nodemailer), spam/rate-limit, SEO
  helpers.
- `_legacy-vite-scaffold/` — the original Figma Make Vite export this
  project was ported from. Kept for design reference only; excluded from
  the TypeScript build (see tsconfig `exclude`). Its `data.ts` content is
  entirely placeholder/demo and was never used.

## Content rules (do not violate)

No invented content: films, books, credits, press, and photography must be
verifiable against `src/content/*.ts` sources (pulled from the live WP
database) or explicitly marked "Coming Soon" / omitted. See git history /
prior session notes for how each fact was verified. Do not add stock
photography, placeholder logos, fake press quotes, or invented awards.

## Toolchain

- Node 22 (see `.mise.toml`), npm (not pnpm — Hostinger's build previously
  failed on a broken pnpm/corepack cache; npm avoids that entirely).
- `npm run dev` / `npm run build` / `npm run start` / `npm run lint` /
  `npm run typecheck`.

## Environment variables

See `.env.example`. Required for the contact/screenwriting forms to
actually send email: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`. Optional:
Cloudflare Turnstile keys (spam protection — falls back to
honeypot+timing+rate-limit if unset), Razorpay/Shiprocket keys (not yet
wired into checkout — do not claim live payment/shipping until they are).
