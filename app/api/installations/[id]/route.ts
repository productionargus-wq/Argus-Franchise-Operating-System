import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const inst = await dbRepository.getInstallationById(params.id, orgId);
    if (!inst) return NextResponse.json({ error: "Installation not found" }, { status: 404 });
    return NextResponse.json(inst);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error(`Failed to fetch installation ${params.id}:`, error);
    return NextResponse.json({ error: error?.message || "Failed to fetch installation" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const orgId = body.orgId || searchParams.get("orgId");
    const updated = await dbRepository.updateInstallation(params.id, body, orgId);
    if (!updated) return NextResponse.json({ error: "Installation not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
