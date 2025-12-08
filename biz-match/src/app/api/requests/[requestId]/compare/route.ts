// src/app/api/requests/[requestId]/compare/route.ts
import { NextRequest, NextResponse } from "next/server";
import { compareShortlistedServices } from "@/modules/request/service/comparison.service";

/**
 * Body shape:
 * {
 *   "services": ["serviceId1", "serviceId2", ...]
 * }
 */
export async function POST(
  request: NextRequest,
  context: any // keep this loose to satisfy Next 16 RouteHandlerConfig
) {
  try {
    // Next 16 types use Promise<{ requestId }>, runtime usually passes plain object.
    const rawParams = await Promise.resolve(context?.params);
    const requestId: string | undefined = rawParams?.requestId;

    if (!requestId) {
      return NextResponse.json(
        { error: "Missing requestId in route params" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const services = body?.services as string[] | undefined;

    if (!Array.isArray(services) || services.length < 2) {
      return NextResponse.json(
        { error: "You must provide at least two service ids to compare" },
        { status: 400 }
      );
    }

    const result = await compareShortlistedServices(requestId, services);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Error in compare route:", err);
    return NextResponse.json(
      {
        error:
          err?.message ??
          "Failed to compare shortlisted services for this request",
      },
      { status: 500 }
    );
  }
}
