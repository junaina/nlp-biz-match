import { NextResponse } from "next/server";
import {
  createServiceForMyBusiness,
  listMyServices,
} from "@/modules/provider/service/provider.service";
import { getErrorMessage } from "@/lib/error";
export async function GET() {
  try {
    const services = await listMyServices();
    return NextResponse.json(services);
  } catch (err: unknown) {
    const message = getErrorMessage(err);

    return NextResponse.json(
      { error: message ?? "Failed to list services" },
      { status: message === "Not authenticated" ? 401 : 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const service = await createServiceForMyBusiness({
      title: body.title,
      description: body.description,
      category: body.category,
      industry: body.industry,
      skills: body.skills ?? [],
      minBudget: body.minBudget,
      maxBudget: body.maxBudget,
    });

    return NextResponse.json(service);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    console.error(err);
    return NextResponse.json(
      { error: message ?? "Failed to create service" },
      { status: message === "Not authenticated" ? 401 : 400 }
    );
  }
}
