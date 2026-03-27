import { NextResponse } from "next/server";
import { getProposalDetail, withdrawProposal } from "@/modules/proposals/service/proposal.service";

export async function GET(req: Request, { params }: { params: Promise<{ proposalId: string }> }) {
  try {
    const { proposalId } = await params;
    const proposal = await getProposalDetail(proposalId);
    return NextResponse.json(proposal);
  } catch (error: any) {
    if (error.message === "Not authenticated") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === "Access denied") {
         return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ proposalId: string }> }) {
  try {
    const { proposalId } = await params;
    const body = await req.json();
    if (body.status === 'WITHDRAWN') {
      const proposal = await withdrawProposal(proposalId);
      return NextResponse.json(proposal);
    }
    return NextResponse.json({ error: "Unsupported status update" }, { status: 400 });
  } catch (error: any) {
    if (error.message === "Not authenticated") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
