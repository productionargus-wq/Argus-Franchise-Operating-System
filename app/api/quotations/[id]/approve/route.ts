import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const orgId = body.orgId || searchParams.get("orgId");
    const { action, approverName, reason } = body;

    if (action === "approve") {
      const quote = await dbRepository.approveQuotation(params.id, approverName || "HO Super Admin", reason, orgId);
      if (!quote) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
      return NextResponse.json(quote);
    } else if (action === "reject") {
      const quote = await dbRepository.rejectQuotation(params.id, approverName || "HO Super Admin", reason || "Discount outside commercial margins.", orgId);
      if (!quote) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
      return NextResponse.json(quote);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
