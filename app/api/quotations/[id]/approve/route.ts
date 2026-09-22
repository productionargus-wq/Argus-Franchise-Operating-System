import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { action, approverName, reason } = body;

    if (action === "approve") {
      const quote = await dbRepository.approveQuotation(params.id, approverName || "HO Super Admin", reason);
      if (!quote) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
      return NextResponse.json(quote);
    } else if (action === "reject") {
      const quote = await dbRepository.rejectQuotation(params.id, approverName || "HO Super Admin", reason || "Discount outside commercial margins.");
      if (!quote) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
      return NextResponse.json(quote);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
