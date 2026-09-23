import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const franchiseId = searchParams.get("franchiseId");
    const commissions = await dbRepository.getCommissions(orgId, franchiseId);
    return NextResponse.json(commissions);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to fetch commissions:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch commissions" }, { status: 500 });
  }
}
