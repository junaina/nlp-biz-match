// src/modules/request/client/comparison.client.ts
"use client";

import type { ComparisonResult } from "../domain/comparison.domain";

export async function fetchComparisonClient(
  requestId: string,
  serviceIds: string[]
): Promise<ComparisonResult> {
  const res = await fetch(`/api/requests/${requestId}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ serviceIds }),
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to load comparison");
  }

  return res.json();
}
