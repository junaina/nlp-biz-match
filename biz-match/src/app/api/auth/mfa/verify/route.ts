import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseFromBearerToken } from "@/lib/supabase/from-token";

type VerifyBody = { factorId?: unknown; code?: unknown };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getBearer(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (!h) return null;
  const [type, token] = h.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  if (!isRecord(body)) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { factorId, code } = body as VerifyBody;

  if (typeof factorId !== "string" || typeof code !== "string") {
    return NextResponse.json(
      { error: "factorId and code are required" },
      { status: 400 },
    );
  }

  // ✅ Prefer cookie-based session (web app & Postman cookies)
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  // If no cookie session, fall back to Bearer token (Postman/manual)
  let client = supabase;
  if (!userData.user) {
    const token = getBearer(req);
    if (!token) {
      return NextResponse.json(
        { error: "Missing session (cookie) or bearer token" },
        { status: 401 },
      );
    }
    client = supabaseFromBearerToken(token);
  }

  const { data, error } = await client.auth.mfa.challengeAndVerify({
    factorId,
    code,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // If cookie-based client was used, Supabase SSR will write upgraded AAL2 cookies automatically.
  return NextResponse.json({ ok: true, data });
}
