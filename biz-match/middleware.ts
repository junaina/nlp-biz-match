import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const APP_PREFIXES = ["/app"];

// Pages that must remain accessible to complete auth/MFA flow
const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/mfa/setup",
  "/mfa/verify",
]);

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // allow anything under /mfa/*
  if (pathname === "/mfa" || pathname.startsWith("/mfa/")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // Only enforce policy for your app area (adjust if you want it stricter)
  const isApp = startsWithAny(pathname, APP_PREFIXES);

  // Let public pages through (login/register/mfa pages)
  if (!isApp && isPublicPath(pathname)) {
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // 1) Must be signed in for /app/**
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    if (isApp) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return res;
  }

  // If user is signed in and tries to go to login/register, bounce to app
  if (pathname === "/login" || pathname === "/register") {
    const url = req.nextUrl.clone();
    url.pathname = "/app";
    return NextResponse.redirect(url);
  }

  // 2) Mandatory MFA enrollment for /app/**
  if (isApp) {
    // Check whether the user has ANY TOTP factor
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const hasTotp =
      (factorsData?.totp?.length ?? 0) > 0 ||
      (user.factors?.some((f) => f.factor_type === "totp") ?? false);

    if (!hasTotp && pathname !== "/mfa/setup") {
      const url = req.nextUrl.clone();
      url.pathname = "/mfa/setup";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // 3) Mandatory step-up to AAL2 for /app/**
    // If they have a TOTP factor but current session is only AAL1,
    // force them to verify.
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const current = aal?.currentLevel ?? null;
    const next = aal?.nextLevel ?? null;

    const mustVerify = hasTotp && current === "aal1" && next === "aal2";
    if (mustVerify && pathname !== "/mfa/verify") {
      const url = req.nextUrl.clone();
      url.pathname = "/mfa/verify";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return res;
}

/**
 * IMPORTANT:
 * - This matcher excludes /api so Postman calls don't get redirected.
 * - If you also want to protect API routes, we’ll add AAL2 checks inside API handlers.
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
