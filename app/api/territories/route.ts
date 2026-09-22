import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get("pincode");
  const franchiseId = searchParams.get("franchiseId");

  if (pincode && franchiseId) {
    const conflict = await dbRepository.checkTerritoryConflict(pincode, franchiseId);
    return NextResponse.json(conflict);
  }

  const territories = await dbRepository.getTerritories();
  return NextResponse.json(territories);
}
