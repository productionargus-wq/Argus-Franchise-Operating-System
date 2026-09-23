import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    let orgId = searchParams.get("orgId");
    try {
      const body = await request.json();
      if (body?.orgId) orgId = body.orgId;
    } catch {
      // Body may be empty
    }
    const op = await dbRepository.convertLeadToOpportunity(params.id, orgId);
    if (!op) {
      return NextResponse.json({ error: "Lead could not be converted or not found" }, { status: 400 });
    }
    return NextResponse.json(op);
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    console.error(`Failed to convert lead ${params.id}:`, err);
    return NextResponse.json({ error: err?.message || "Failed to convert lead" }, { status: 500 });
  }
}
