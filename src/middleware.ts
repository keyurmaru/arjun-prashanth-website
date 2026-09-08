import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken, hasAccess, ROLE_ACCESS, type AdminRole } from "@/lib/auth";

// Maps a protected path prefix to the RBAC module it requires. Checked here
// (server-side, before the request ever reaches a page or API route) so
// authorization never depends on a client hiding a UI control — this is the
// actual enforcement boundary, not the admin layout's nav rendering.
const PROTECTED_PREFIXES: { prefix: string; module: keyof typeof ROLE_ACCESS }[] = [
  { prefix: "/admin/books", module: "books" },
  { prefix: "/admin/users", module: "users" },
  { prefix: "/admin/orders", module: "orders_read" },
  { prefix: "/admin/dashboard", module: "dashboard" },
  { prefix: "/api/admin/books", module: "books" },
  { prefix: "/api/admin/users", module: "users" },
  { prefix: "/api/admin/orders", module: "orders_read" },
];

// Only /admin and /api/admin ever hit this middleware (see matcher below).
// The root layout can't call usePathname() (it's a server component), so we
// forward the path as a REQUEST header — its presence is also how the root
// layout knows to skip the public site's Header/Footer/cart chrome for the
// admin panel, since only these paths ever set it.
function nextWithPathname(req: NextRequest, pathname: string): NextResponse {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers } });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login" || pathname === "/api/admin/auth/login") {
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
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
