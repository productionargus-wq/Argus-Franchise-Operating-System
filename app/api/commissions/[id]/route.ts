import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { status, paymentReference } = body;
    const comm = dbRepository.updateCommissionStatus(params.id, status, paymentReference);
    if (!comm) return NextResponse.json({ error: "Commission not found" }, { status: 404 });
    return NextResponse.json(comm);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
