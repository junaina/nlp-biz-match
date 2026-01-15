// src/app/api/buyer/requests/route.ts
import { NextResponse } from "next/server";
import { createRequestAndMatch } from "@/modules/request/service/request.service";
import { getErrorMessage } from "@/lib/error";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.description || typeof body.description !== "string") {
      return NextResponse.json(
        { error: "description is required" },
        { status: 400 }
      );
    }

    const result = await createRequestAndMatch({
      description: body.description,
      title: body.title,
      budgetMin: body.budgetMin ?? null,
      budgetMax: body.budgetMax ?? null,
      industry: body.industry ?? null,
      timeline: body.timeline ?? null,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = getErrorMessage(err);

    if (message === "Unauthenticated") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    console.error("POST /api/buyer/requests", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
