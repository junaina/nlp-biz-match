// src/modules/request/client/shortlist.client.ts
"use client";

export async function addToShortlistClient(
  requestId: string,
  providerServiceId: string
) {
  const res = await fetch("/api/shortlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId, providerServiceId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to add to shortlist");
  }

  return res.json();
}

export async function removeFromShortlistClient(
  requestId: string,
  providerServiceId: string
) {
  const res = await fetch("/api/shortlist", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId, providerServiceId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to remove from shortlist");
  }

  return res.json();
}

export async function fetchShortlistClient(requestId: string) {
  const res = await fetch(`/api/requests/${requestId}/shortlist`, {
    method: "GET",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to load shortlist");
  }

  return res.json(); // { items: ShortlistItemDto[] }
}
