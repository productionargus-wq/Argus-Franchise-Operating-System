import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const orgId = body.orgId || searchParams.get("orgId");
    const { status, paymentReference } = body;
    const comm = await dbRepository.updateCommissionStatus(params.id, status, paymentReference, orgId);
    if (!comm) return NextResponse.json({ error: "Commission not found" }, { status: 404 });
    return NextResponse.json(comm);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
