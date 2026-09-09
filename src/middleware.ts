import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken, hasAccess, ROLE_ACCESS, type AdminRole } from "@/lib/auth";
import { isRateLimited } from "@/lib/rateLimit";

// Maps a protected path prefix to the RBAC module it requires. Checked here
// (server-side, before the request ever reaches a page or API route) so
// authorization never depends on a client hiding a UI control — this is the
// actual enforcement boundary, not the admin layout's nav rendering.
const PROTECTED_PREFIXES: { prefix: string; module: keyof typeof ROLE_ACCESS }[] = [
  { prefix: "/admin/books", module: "books" },
  { prefix: "/admin/films", module: "films" },
  { prefix: "/admin/media", module: "media" },
  { prefix: "/admin/security", module: "security" },
  { prefix: "/admin/users", module: "users" },
  { prefix: "/admin/orders", module: "orders_read" },
  { prefix: "/admin/dashboard", module: "dashboard" },
  { prefix: "/admin/settings", module: "settings" },
  { prefix: "/api/admin/books", module: "books" },
  { prefix: "/api/admin/films", module: "films" },
  { prefix: "/api/admin/media", module: "media" },
  { prefix: "/api/admin/security", module: "security" },
  { prefix: "/api/admin/users", module: "users" },
  { prefix: "/api/admin/orders", module: "orders_read" },
  { prefix: "/api/admin/settings", module: "settings" },
];

// /admin/*, /api/admin/*, and now every /api/* route hits this middleware
// (see matcher below). The root layout can't call usePathname() (it's a
// server component), so we forward the path as a REQUEST header — its
// presence is also how the root layout knows to skip the public site's
// Header/Footer/cart chrome for the admin panel, since only /admin paths
// ever set it.
function nextWithPathname(req: NextRequest, pathname: string): NextResponse {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers } });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Every /api/* path that isn't /api/admin/* (public forms, checkout,
  // webhooks, ...) bypasses all the session/RBAC logic below entirely —
  // those routes have no admin session cookie to check, and letting a
  // webhook or a public POST fall through into it would incorrectly
  // redirect it to /admin/login. A generous rate-limit backstop applies
  // here first, on top of whatever tighter, route-specific limit that
  // handler already applies via isRateLimited() itself (contact form,
  // checkout, notify-me, ...) — except for webhooks, which verify their
  // own signatures and must never be blocked here. This exists so a
  // scripted hammering of any current or future public endpoint can't run
  // away unbounded, entirely in our own code rather than depending on an
  // external service's opaque thresholds. Deliberately does NOT touch
  // page loads (GET /, /films, /books, ...) — an outage from our own rate
  // limiter being too aggressive is exactly the failure mode we're trying
  // to avoid, having just recovered from one caused by an
  // externally-configured one.
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/admin")) {
    if (!pathname.startsWith("/api/webhooks")) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      if (isRateLimited(`api-backstop:${ip}`, { max: 60, windowMs: 60 * 1000 })) {
        return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
      }
    }
    return NextResponse.next();
  }

  // Everything below only ever runs for /admin/* and /api/admin/*.
  // verify-2fa runs with only the short-lived pending-2FA token from
  // login, not a real session cookie — it must bypass the session check
  // below the same way login itself does, or the request that's supposed
  // to complete login would be rejected as "not authenticated".
  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/auth/login" ||
    pathname === "/api/admin/auth/verify-2fa"
  ) {
    return nextWithPathname(req, pathname);
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const match = PROTECTED_PREFIXES.find((p) => pathname.startsWith(p.prefix));
  if (match && !hasAccess(session.role as AdminRole, match.module)) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }
    const url = new URL("/admin/dashboard", req.url);
    url.searchParams.set("forbidden", "1");
    return NextResponse.redirect(url);
  }

  return nextWithPathname(req, pathname);
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
