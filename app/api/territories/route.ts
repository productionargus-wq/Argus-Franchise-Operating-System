import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const pincode = searchParams.get("pincode");
    const franchiseId = searchParams.get("franchiseId");

    if (pincode && franchiseId) {
      const conflict = await dbRepository.checkTerritoryConflict(pincode, franchiseId, orgId);
      return NextResponse.json(conflict);
    }

    const territories = await dbRepository.getTerritories(orgId);
    return NextResponse.json(territories);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to fetch territories:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch territories" }, { status: 500 });
  }
}
