import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const ticket = await dbRepository.getSupportTicketById(params.id);
  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  return NextResponse.json(ticket);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { action, comment, status, resolutionNotes } = body;

    if (action === "add_comment" && comment) {
      const ticket = await dbRepository.addTicketComment(params.id, comment);
      if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
      return NextResponse.json(ticket);
    }

    if (action === "update_status" && status) {
      const ticket = await dbRepository.updateTicketStatus(params.id, status, resolutionNotes);
      if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
      return NextResponse.json(ticket);
    }

    return NextResponse.json({ error: "Invalid patch action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
