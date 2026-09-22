import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchiseId = searchParams.get("franchiseId");
    const installations = await dbRepository.getInstallations(franchiseId);
    return NextResponse.json(installations);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to fetch installations:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch installations" }, { status: 500 });
  }
}
