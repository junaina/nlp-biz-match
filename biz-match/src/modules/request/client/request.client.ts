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

type CreateRequestError = {
  message: string;
  status?: number;
};
export type CreateRequestResult =
  | { ok: true; data: CreateRequestResponse }
  | { ok: false; error: CreateRequestError };

type ErrorBody = {
  error?: string;
  message?: string;
};
export async function createRequestClient(
  payload: CreateRequestPayload
): Promise<CreateRequestResult> {
  try {
    const res = await fetch("/api/buyer/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!res.ok) {
      let body: ErrorBody | null = null;

      // Safely attempt JSON error body (no any/unknown)
      try {
        body = (await res.json()) as ErrorBody;
      } catch {
        body = null;
      }

      return {
        ok: false,
        error: {
          status: res.status,
          message:
            body?.error ??
            body?.message ??
            `Failed to create request (${res.status})`,
        },
      };
    }

    const data = (await res.json()) as CreateRequestResponse;
    return { ok: true, data };
  } catch {
    // catch without binding => no unknown/any
    return {
      ok: false,
      error: { message: "Network error. Please try again." },
    };
  }
}
