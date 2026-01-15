// src/app/api/requests/[requestId]/compare/route.ts
import { NextRequest, NextResponse } from "next/server";
import { compareShortlistedServices } from "@/modules/request/service/comparison.service";
import { getErrorMessage } from "@/lib/error";
import { isRecord, isStringArray } from "@/lib/typeguards";

type RouteContext = {
  params?: { requestId?: string } | Promise<{ requestId?: string }>;
};

/**
 * Body shape:
 * {
 *   "services": ["serviceId1", "serviceId2", ...]
 * }
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const rawParams = await Promise.resolve(context?.params);
    const requestId = rawParams?.requestId;

    if (!requestId) {
      return NextResponse.json(
        { error: "Missing requestId in route params" },
        { status: 400 }
      );
    }

    const rawBody: unknown = await request.json();
    if (!isRecord(rawBody)) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const services = rawBody.services;
    if (!isStringArray(services) || services.length < 2) {
      return NextResponse.json(
        { error: "You must provide at least two service ids to compare" },
        { status: 400 }
      );
    }

    const result = await compareShortlistedServices(requestId, services);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Error in compare route:", err);
    return NextResponse.json(
      {
        error:
          getErrorMessage(err) ||
          "Failed to compare shortlisted services for this request",
      },
      { status: 500 }
    );
  }
}
