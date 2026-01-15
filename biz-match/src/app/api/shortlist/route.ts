// src/app/api/shortlist/route.ts
import { NextResponse } from "next/server";
import {
  addToShortlist,
  removeFromShortlist,
} from "@/modules/request/service/shortlist.service";
import { getErrorMessage } from "@/lib/error";
import { isRecord } from "@/lib/typeguards";

function parseShortlistBody(
  raw: unknown
): { requestId: string; providerServiceId: string } | null {
  if (!isRecord(raw)) return null;

  const requestId = raw.requestId;
  const providerServiceId = raw.providerServiceId;

  if (typeof requestId !== "string" || typeof providerServiceId !== "string")
    return null;

  return { requestId, providerServiceId };
}

export async function POST(req: Request) {
  try {
    const rawBody: unknown = await req.json();
    const parsed = parseShortlistBody(rawBody);

    if (!parsed) {
      return NextResponse.json(
        { error: "requestId and providerServiceId are required" },
        { status: 400 }
      );
    }

    const item = await addToShortlist(
      parsed.requestId,
      parsed.providerServiceId
    );
    return NextResponse.json({ item }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/shortlist error", err);
    return NextResponse.json(
      { error: getErrorMessage(err) || "Failed to add to shortlist" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const rawBody: unknown = await req.json();
    const parsed = parseShortlistBody(rawBody);

    if (!parsed) {
      return NextResponse.json(
        { error: "requestId and providerServiceId are required" },
        { status: 400 }
      );
    }

    await removeFromShortlist(parsed.requestId, parsed.providerServiceId);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("DELETE /api/shortlist error", err);
    return NextResponse.json(
      { error: getErrorMessage(err) || "Failed to remove from shortlist" },
      { status: 400 }
    );
  }
}
