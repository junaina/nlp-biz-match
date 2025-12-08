// src/modules/request/client/request.client.ts
"use client";

import type { MatchResult, RequestSummary } from "../domain/request.types";

type CreateRequestPayload = {
  description: string;
  title?: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  industry?: string | null;
  timeline?: string | null;
};

export type CreateRequestResponse = {
  request: RequestSummary;
  matches: MatchResult[];
};

export async function createRequestClient(
  payload: CreateRequestPayload
): Promise<CreateRequestResponse> {
  const res = await fetch("/api/buyer/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to create request");
  }

  return res.json();
}
