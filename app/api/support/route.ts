import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const franchiseId = searchParams.get("franchiseId");
    const tickets = await dbRepository.getSupportTickets(orgId, franchiseId);
    return NextResponse.json(tickets);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to fetch support tickets:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch support tickets" }, { status: 500 });
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
    const newTicket = await dbRepository.createSupportTicket(body, orgId);
    return NextResponse.json(newTicket, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create support ticket:", err);
    const status = err?.code === 11000 ? 409 : 400;
    return NextResponse.json({ error: err.message || "Failed to create support ticket" }, { status });
  }
}
