import { NextResponse } from "next/server";
import { submitProposal } from "@/modules/proposals/service/proposal.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const proposal = await submitProposal(body);
    return NextResponse.json(proposal, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
