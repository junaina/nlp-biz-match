// src/app/api/requests/[requestId]/compare/route.ts
import { NextResponse } from "next/server";
import { compareShortlistedServices } from "@/modules/request/service/comparison.service";

type Params = {
  params: { requestId: string };
};

export async function POST(req: Request, { params }: Params) {
  try {
    const { requestId } = params;
    const body = await req.json().catch(() => ({}));
    const serviceIds = Array.isArray(body.serviceIds) ? body.serviceIds : [];

    if (!requestId || !serviceIds.length) {
      return NextResponse.json(
        { error: "requestId and serviceIds are required" },
        { status: 400 }
      );
    }

    const result = await compareShortlistedServices(requestId, serviceIds);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Compare route error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to compare services" },
      { status: 400 }
    );
  }
}
