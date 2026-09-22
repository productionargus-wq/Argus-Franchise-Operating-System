import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { type, channel } = body;
    const renewal = await dbRepository.triggerRenewalReminder(params.id, type, channel || "WhatsApp");
    if (!renewal) return NextResponse.json({ error: "Renewal not found" }, { status: 404 });
    return NextResponse.json(renewal);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
