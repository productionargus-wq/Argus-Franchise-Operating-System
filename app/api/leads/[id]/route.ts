import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    if (searchParams.get("related") === "true") {
      const counts = await dbRepository.getLeadRelatedCounts(params.id, orgId);
      return NextResponse.json(counts);
    }
    const lead = await dbRepository.getLeadById(params.id, orgId);
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    return NextResponse.json(lead);
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    console.error(`Failed to fetch lead ${params.id}:`, err);
    return NextResponse.json({ error: err?.message || "Failed to fetch lead" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const orgId = body.orgId || searchParams.get("orgId");
    const updated = await dbRepository.updateLead(params.id, body, orgId);
    if (!updated) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    if (!orgId) return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    const success = await dbRepository.deleteLead(params.id, orgId);
    if (!success) return NextResponse.json({ error: "Lead not found or could not be deleted" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Lead deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
