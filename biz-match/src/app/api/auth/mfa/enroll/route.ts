import { NextResponse } from "next/server";
import {
  supabaseFromBearerToken,
  getBearerTokenFromHeaders,
} from "@/lib/supabase/from-token";

export async function POST(req: Request) {
  const token = getBearerTokenFromHeaders(req);
  if (!token)
    return NextResponse.json(
      { error: "Missing Bearer token" },
      { status: 401 },
    );

  const { friendlyName } = await req.json().catch(() => ({}));

  const supabase = supabaseFromBearerToken(token);

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: friendlyName ?? "Authenticator",
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  // data.totp contains qr_code + uri
  return NextResponse.json({
    factorId: data.id,
    totp: data.totp, // includes qr_code + uri
  });
}
