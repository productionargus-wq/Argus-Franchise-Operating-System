import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const franchiseId = searchParams.get("franchiseId");
  const view = searchParams.get("view"); // "ho" or "franchise"

  if (view === "ho" || !franchiseId) {
    const data = dbRepository.getHeadOfficeDashboardKPIs();
    return NextResponse.json(data);
  } else {
    const data = dbRepository.getFranchiseDashboardKPIs(franchiseId);
    return NextResponse.json(data);
  }
}
