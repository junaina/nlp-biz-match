// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { login } from "@/modules/auth/service/auth.service";
import { AuthError } from "@/lib/error";
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { user, business, token } = await login({ email, password });

    const cookieStore = await cookies(); // 👈 important
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
