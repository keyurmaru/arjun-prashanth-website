/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // This host reports 64 CPUs (a shared-hosting quirk), which makes Next.js
  // default to spawning dozens of build worker processes. The hosting
  // account's process-count limit (CloudLinux LVE) rejects that with
  // EAGAIN on spawn, so cap it explicitly to a small, safe number.
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "arjunprashanth.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  async headers() {
    // Hosting-panel env var UIs don't always preserve exact casing (this one
    // is stored as "TRUE" in hPanel), so compare case-insensitively.
    const isStaging = (process.env.NEXT_PUBLIC_IS_STAGING || "").toLowerCase() === "true";
    // Every external origin the site actually loads something from —
    // audited directly against the source AND a live checkout run
    // (2026-09-09), not guessed: Turnstile (contact/screenwriting forms),
    // Razorpay (checkout.js, its own risk-detection bundle from
    // cdn.razorpay.com, and its XHR calls during payment), Google
    // Analytics (gtag.js), YouTube/Vimeo (film video embeds). next/font/
    // google self-hosts font files at build time (served from
    // /_next/static, same-origin), so no font-src entry is needed for it.
    // 'unsafe-inline' on script-src is a deliberate, pragmatic tradeoff:
    // Next.js's own hydration payload and this app's few inline <Script>
    // blocks (GA init, Turnstile callback) are inline by default, and
    // switching to nonce-based strict CSP is a larger, separate change —
    // this policy still blocks the more common attack (an injected
    // <script src="attacker.example/x.js">), just not injected inline
    // script text.
    //
    // NOTE: this header alone does NOT reach the browser in production —
    // Hostinger's platform layer was found to silently overwrite the
    // app's Content-Security-Policy with a bare "upgrade-insecure-
    // requests" (every other header here passes through untouched). The
    // actual enforced policy lives in public_html/.htaccess (a "Header
    // always set" directive, which does take precedence) and must be kept
    // in sync with this one by hand. This copy still matters for local
    // dev (`next dev`/`next start`, no Apache in front) and as the source
    // of truth to copy from.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://checkout.razorpay.com https://www.googletagmanager.com https://cdn.razorpay.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com https://cdn.razorpay.com https://www.google-analytics.com https://analytics.google.com https://challenges.cloudflare.com",
      "frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com https://api.razorpay.com https://checkout.razorpay.com https://challenges.cloudflare.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: csp },
      // Forces browsers to only ever use HTTPS for this domain, even if a
      // future request is somehow made over plain HTTP — no equivalent
      // header was being sent (checked live 2026-09-09; Cloudflare, which
      // can add this itself, was also off at the time following the DNS
      // proxy outage). 1 year, no includeSubDomains/preload since some
      // subdomains (mail autoconfig, DKIM CNAMEs) haven't been individually
      // confirmed to be HTTPS-safe.
      { key: "Strict-Transport-Security", value: "max-age=31536000" },
    ];
    // Belt-and-braces: this HTTP header blocks indexing regardless of
    // whether the per-page <meta robots> tag renders correctly or whether
    // a CDN/edge layer in front of the app serves its own robots.txt
    // (Hostinger's edge was observed doing exactly that for this domain).
    if (isStaging) {
      securityHeaders.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    }
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // These read live content from the database at request time
        // (`export const dynamic = "force-dynamic"`) — without an explicit
        // Cache-Control, Hostinger's LiteSpeed edge cache was observed
        // caching the homepage's HTML anyway, so an admin publishing a
        // change (a new featured film, a price update, ...) wouldn't show
        // up for visitors until the cache happened to expire.
        source: "/",
        headers: [{ key: "Cache-Control", value: "private, no-cache, no-store, max-age=0, must-revalidate" }],
      },
      {
        source: "/:path(films|books|director|author|sitemap.xml)/:rest*",
        headers: [{ key: "Cache-Control", value: "private, no-cache, no-store, max-age=0, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
