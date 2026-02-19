import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Allow auth pages and API auth routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/api/auth")
  ) {
    // Redirect to browse if already logged in and visiting login/signup
    if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/browse", req.nextUrl));
    }
    return NextResponse.next();
  }

  // Require auth for everything else
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
