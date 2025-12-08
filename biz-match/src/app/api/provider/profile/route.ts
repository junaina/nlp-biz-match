import { NextResponse } from "next/server";
import { updateMyBusinessProfile } from "@/modules/provider/service/provider.service";

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
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message ?? "Failed to update profile" },
      { status: err.message === "Not authenticated" ? 401 : 400 }
    );
  }
}
