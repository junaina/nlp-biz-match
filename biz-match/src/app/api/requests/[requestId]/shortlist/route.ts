// src/app/api/requests/[requestId]/shortlist/route.ts
import { NextResponse } from "next/server";
import { listShortlistForRequest } from "@/modules/request/service/shortlist.service";
import { getErrorMessage } from "@/lib/error";

// `params` is a Promise now
type RouteContext = {
  params: Promise<{
    requestId: string;
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { requestId } = await context.params;

    const items = await listShortlistForRequest(requestId);
    return NextResponse.json({ items });
  } catch (err: unknown) {
    console.error("GET /api/requests/[requestId]/shortlist error", err);
    return NextResponse.json(
      { error: getErrorMessage(err) || "Failed to load shortlist" },
      { status: 400 }
    );
  }
}
