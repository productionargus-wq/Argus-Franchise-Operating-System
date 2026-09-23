import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const quote = await dbRepository.getQuotationById(params.id, orgId);
    if (!quote) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    return NextResponse.json(quote);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error(`Failed to fetch quotation ${params.id}:`, error);
    return NextResponse.json({ error: error?.message || "Failed to fetch quotation" }, { status: 500 });
  }
}
