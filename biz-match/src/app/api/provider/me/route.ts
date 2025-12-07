import { NextResponse } from "next/server";
import { getMyBusiness } from "@/modules/provider/service/provider.service";

export async function GET() {
  const business = await getMyBusiness();
  if (!business) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json(business);
}
