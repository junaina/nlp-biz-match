import { NextResponse } from "next/server";
import { getMyProposals } from "@/modules/proposals/service/proposal.service";

export async function GET(req: Request, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await params;
    const proposals = await getMyProposals(requestId);
    return NextResponse.json(proposals);
  } catch (error: any) {
    if (error.message === "Not authenticated") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
