// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { register } from "@/modules/auth/service/auth.service"; // the service that creates user+business+token
import { AuthError } from "@/lib/error";

export async function POST(request: Request) {
  try {
    const { name, businessName, email, password } = await request.json();

    if (!name || !businessName || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { user, business, token } = await register({
      name,
      businessName,
      email,
      password,
    });

    const cookieStore = await cookies(); // 👈 NEW: await cookies()
    const days = Number(process.env.JWT_EXPIRES_IN_DAYS ?? "7");

    cookieStore.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * days,
    });

    return NextResponse.json({ userId: user.id, businessId: business.id });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
