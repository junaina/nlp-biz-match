// src/app/api/requests/[requestId]/shortlist/route.ts
import { NextResponse } from "next/server";
import { listShortlistForRequest } from "@/modules/request/service/shortlist.service";

// `params` is a Promise now
type RouteContext = {
  params: Promise<{
    requestId: string;
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    // unwrap the promise
    const { requestId } = await context.params;

    const items = await listShortlistForRequest(requestId);
    return NextResponse.json({ items });
  } catch (err: any) {
    console.error("GET /api/requests/[requestId]/shortlist error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to load shortlist" },
      { status: 400 }
    );
  }
}
