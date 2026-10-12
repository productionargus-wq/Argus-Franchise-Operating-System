import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const franchiseId = searchParams.get("franchiseId");
    const invoices = await dbRepository.getInvoices(orgId, franchiseId);
    return NextResponse.json(invoices);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const orgId = body.orgId || searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    const newInvoice = await dbRepository.createInvoice(body, orgId);
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create invoice:", err);
    return NextResponse.json({ error: err.message || "Failed to create invoice" }, { status: 400 });
  }
}
