import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const franchises = await dbRepository.getFranchises();
    return NextResponse.json(franchises);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to get franchises:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch franchises" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.code) {
      return NextResponse.json(
        { error: "Franchise Name and Code are required" },
        { status: 400 }
      );
    }
    const result = await dbRepository.createFranchise(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create franchise:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error creating franchise" },
      { status: 500 }
    );
  }
}

