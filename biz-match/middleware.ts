// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /app/* routes except /login & /register
  if (pathname.startsWith("/app")) {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
