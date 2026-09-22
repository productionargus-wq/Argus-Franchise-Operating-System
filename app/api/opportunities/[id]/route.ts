import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const opp = await dbRepository.getOpportunityById(params.id);
    if (!opp) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    return NextResponse.json(opp);
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    console.error(`Failed to fetch opportunity ${params.id}:`, err);
    return NextResponse.json({ error: err?.message || "Failed to fetch opportunity" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updated = await dbRepository.updateOpportunity(params.id, body);
    if (!updated) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
