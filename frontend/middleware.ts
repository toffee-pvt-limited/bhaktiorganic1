import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;

  // Allow access to login page
  if (req.nextUrl.pathname === "/admin/login") {
    // If already logged in, redirect to admin dashboard
    if (token) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // For all other admin routes, check if token exists
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Token exists, allow access
  // Note: JWT verification happens in API routes, not middleware
  // because jsonwebtoken doesn't work in Edge runtime
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
