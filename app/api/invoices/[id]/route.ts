import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    const invoice = await dbRepository.getInvoiceById(params.id, orgId);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json(invoice);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error(`Failed to fetch invoice ${params.id}:`, error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const orgId = body.orgId || searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    const updated = await dbRepository.updateInvoiceStatus(params.id, body, orgId);
    if (!updated) {
      return NextResponse.json({ error: "Invoice not found or could not be updated" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(`Failed to update invoice ${params.id}:`, error);
    return NextResponse.json(
      { error: error?.message || "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    const success = await dbRepository.deleteInvoice(params.id, orgId);
    if (!success) {
      return NextResponse.json({ error: "Invoice not found or could not be deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error: any) {
    console.error(`Failed to delete invoice ${params.id}:`, error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
