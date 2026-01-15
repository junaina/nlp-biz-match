import { NextResponse } from "next/server";
import { updateMyBusinessProfile } from "@/modules/provider/service/provider.service";
import { getErrorMessage } from "@/lib/error";
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const updated = await updateMyBusinessProfile({
      name: body.name,
      logoUrl: body.logoUrl,
      locationCity: body.locationCity,
      locationCountry: body.locationCountry,
      website: body.website,
      bio: body.bio,
      isBuyer: body.isBuyer,
      isProvider: body.isProvider,
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    console.error(err);
    if (message === "Unauthenticated") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    console.error("route failed:", err);
    return NextResponse.json(
      { error: message || "Internal server error" },
      { status: 500 }
    );
  }
}
