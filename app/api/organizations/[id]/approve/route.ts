import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { action, approvedBy, reason } = body;

    if (action === "approve") {
      const updated = await dbRepository.approveOrganization(params.id, approvedBy || "Super Admin");
      if (!updated) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      return NextResponse.json({ success: true, organization: updated });
    }

    if (action === "reject") {
      const updated = await dbRepository.rejectOrganization(params.id, approvedBy || "Super Admin", reason);
      if (!updated) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      return NextResponse.json({ success: true, organization: updated });
    }

    return NextResponse.json({ error: "Invalid action. Expected 'approve' or 'reject'." }, { status: 400 });
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error(`Failed to process approval for org ${params.id}:`, error);
    return NextResponse.json({ error: error?.message || "Failed to process organization approval" }, { status: 500 });
  }
}
