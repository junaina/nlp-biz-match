// src/app/api/shortlist/route.ts
import { NextResponse } from "next/server";
import {
  addToShortlist,
  removeFromShortlist,
} from "@/modules/request/service/shortlist.service";

export async function POST(req: Request) {
  try {
    const { requestId, providerServiceId } = await req.json();

    if (!requestId || !providerServiceId) {
      return NextResponse.json(
        { error: "requestId and providerServiceId are required" },
        { status: 400 }
      );
    }

    const item = await addToShortlist(requestId, providerServiceId);
    return NextResponse.json({ item }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/shortlist error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to add to shortlist" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { requestId, providerServiceId } = await req.json();

    if (!requestId || !providerServiceId) {
      return NextResponse.json(
        { error: "requestId and providerServiceId are required" },
        { status: 400 }
      );
    }

    await removeFromShortlist(requestId, providerServiceId);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/shortlist error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to remove from shortlist" },
      { status: 400 }
    );
  }
}
