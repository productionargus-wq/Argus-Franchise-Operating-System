import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const opp = await dbRepository.getOpportunityById(params.id);
  if (!opp) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  return NextResponse.json(opp);
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
