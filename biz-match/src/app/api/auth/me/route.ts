// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: factorsData } = await supabase.auth.mfa.listFactors();
  const totpFactors = factorsData?.totp ?? [];

  const hasAnyTotp =
    totpFactors.length > 0 ||
    (user.factors?.some((f) => f.factor_type === "totp") ?? false);

  const { data: aalData } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  const currentLevel = aalData?.currentLevel ?? null;
  const nextLevel = aalData?.nextLevel ?? null;

  const mustEnroll = !hasAnyTotp;
  const mustVerify =
    hasAnyTotp && currentLevel === "aal1" && nextLevel === "aal2";

  return NextResponse.json({
    user,
    mfa: {
      mustEnroll,
      mustVerify,
      currentLevel,
      nextLevel,
    },
  });
}
