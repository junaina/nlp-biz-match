// src/modules/auth/client/auth.client.ts
import { cookies } from "next/headers";
import { login, register } from "../service/auth.service";
import type { RegisterInput, LoginInput } from "../domain/auth.types";

const COOKIE_NAME = "auth_token";

async function setAuthCookie(token: string) {
  const store = await cookies();
  const days = Number(process.env.JWT_EXPIRES_IN_DAYS ?? "7");
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * days,
  });
}

export async function registerAndLogin(input: RegisterInput) {
  const { user, business, token } = await register(input);
  await setAuthCookie(token);
  return { user, business };
}

export async function loginAndSetCookie(input: LoginInput) {
  const { user, business, token } = await login(input);
  await setAuthCookie(token);
  return { user, business };
}
