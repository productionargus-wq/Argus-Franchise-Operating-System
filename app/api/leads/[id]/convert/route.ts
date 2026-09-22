import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const op = dbRepository.convertLeadToOpportunity(params.id);
  if (!op) {
    return NextResponse.json({ error: "Lead could not be converted or not found" }, { status: 400 });
  }
  return NextResponse.json(op);
}
