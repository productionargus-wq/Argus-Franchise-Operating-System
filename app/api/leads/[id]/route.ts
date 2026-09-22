import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const lead = await dbRepository.getLeadById(params.id);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updated = await dbRepository.updateLead(params.id, body);
    if (!updated) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
