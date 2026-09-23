import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const franchiseId = searchParams.get("franchiseId");
    const view = searchParams.get("view"); // "ho" or "franchise"

    if (view === "ho" || !franchiseId) {
      const data = await dbRepository.getHeadOfficeDashboardKPIs(orgId);
      return NextResponse.json(data);
    } else {
      const data = await dbRepository.getFranchiseDashboardKPIs(franchiseId, orgId);
      return NextResponse.json(data);
    }
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") {
      throw error;
    }
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
