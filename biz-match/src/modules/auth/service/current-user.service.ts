// src/modules/auth/service/current-user.service.ts
"use server";

import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/jwt";
import { findUserById } from "../repo/auth.repo";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  try {
    const payload = await verifyAuthToken(token);
    const user = await findUserById(payload.sub);
    return user;
  } catch {
    return null;
  }
}
