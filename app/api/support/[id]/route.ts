import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const ticket = await dbRepository.getSupportTicketById(params.id, orgId);
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    return NextResponse.json(ticket);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error(`Failed to fetch support ticket ${params.id}:`, error);
    return NextResponse.json({ error: error?.message || "Failed to fetch support ticket" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const orgId = body.orgId || searchParams.get("orgId");
    const { action, comment, status, resolutionNotes } = body;

    if (action === "add_comment" && comment) {
      const ticket = await dbRepository.addTicketComment(params.id, comment, orgId);
      if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
      return NextResponse.json(ticket);
    }

    if (action === "update_status" && status) {
      const ticket = await dbRepository.updateTicketStatus(params.id, status, resolutionNotes, orgId);
      if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
      return NextResponse.json(ticket);
    }

    return NextResponse.json({ error: "Invalid patch action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
