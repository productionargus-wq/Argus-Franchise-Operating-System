import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const franchiseId = searchParams.get("franchiseId");
    const renewals = await dbRepository.getRenewals(orgId, franchiseId);
    return NextResponse.json(renewals);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to fetch renewals:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch renewals" }, { status: 500 });
  }
}
