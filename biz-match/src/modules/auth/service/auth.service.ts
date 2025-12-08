// src/modules/auth/service/auth.service.ts
"use server";

import type { RegisterInput, LoginInput } from "../domain/auth.types";
import {
  createBusinessAndUser,
  findUserByEmail,
  findUserById,
} from "../repo/auth.repo";
import { hashPassword, verifyPassword } from "@/lib/password";
import { signAuthToken } from "@/lib/jwt";

export async function register(input: RegisterInput) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new Error("Email already in use");
  }

  const passwordHash = await hashPassword(input.password);

  const { user, business } = await createBusinessAndUser({
    businessName: input.businessName,
    userName: input.name,
    email: input.email,
    passwordHash,
  });

  const token = await signAuthToken({ sub: user.id, businessId: business.id });

  return { user, business, token };
}

export async function login(input: LoginInput) {
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    throw new Error("Invalid credentials");
  }

  const token = await signAuthToken({
    sub: user.id,
    businessId: user.businessId,
  });

  return { user, business: user.business, token };
}

export async function getUserWithBusiness(userId: string) {
  return findUserById(userId);
}
