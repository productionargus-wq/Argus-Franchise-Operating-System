import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchiseId = searchParams.get("franchiseId");
    const leads = await dbRepository.getLeads(franchiseId);
    return NextResponse.json(leads);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to fetch leads:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newLead = await dbRepository.createLead(body);
    return NextResponse.json(newLead, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
