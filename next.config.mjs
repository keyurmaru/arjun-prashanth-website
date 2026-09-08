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
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
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
