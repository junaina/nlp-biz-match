// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, password } = body as LoginBody;

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return NextResponse.json(
      { error: error?.message ?? "Invalid credentials" },
      { status: 401 },
    );
  }

  // Mandatory 2FA logic:
  // 1) mustEnroll if no TOTP factor exists
  // 2) mustVerify if AAL is 1 and can step up to 2

  const { data: factorsData, error: factorsErr } =
    await supabase.auth.mfa.listFactors();
  if (factorsErr) {
    return NextResponse.json({ error: factorsErr.message }, { status: 500 });
  }

  const hasAnyTotp =
    (factorsData?.totp?.length ?? 0) > 0 ||
    // Some projects expose factors only on user object; this keeps it robust:
    (data.user?.factors?.some((f) => f.factor_type === "totp") ?? false);

  if (!hasAnyTotp) {
    // User is logged in (cookie set), but must enroll before entering app
    return NextResponse.json({
      ok: true,
      mfa: { mustEnroll: true, mustVerify: false },
      next: "/mfa/setup",
    });
  }

  const { data: aalData, error: aalErr } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalErr) {
    return NextResponse.json({ error: aalErr.message }, { status: 500 });
  }

  const currentLevel = aalData?.currentLevel ?? null;
  const nextLevel = aalData?.nextLevel ?? null;

  const mustVerify = currentLevel === "aal1" && nextLevel === "aal2";
  if (mustVerify) {
    return NextResponse.json({
      ok: true,
      mfa: { mustEnroll: false, mustVerify: true },
      next: "/mfa/verify",
    });
  }

  // If already AAL2, let them in
  return NextResponse.json({
    ok: true,
    mfa: { mustEnroll: false, mustVerify: false },
    next: "/app", // adjust to your actual landing route
  });
}
