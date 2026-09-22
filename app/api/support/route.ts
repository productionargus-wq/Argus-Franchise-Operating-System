import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const franchiseId = searchParams.get("franchiseId");
  const tickets = dbRepository.getSupportTickets(franchiseId);
  return NextResponse.json(tickets);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTicket = dbRepository.createSupportTicket(body);
    return NextResponse.json(newTicket, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
