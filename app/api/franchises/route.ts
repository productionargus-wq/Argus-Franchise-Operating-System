import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function GET() {
  const franchises = dbRepository.getFranchises();
  return NextResponse.json(franchises);
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
    const result = dbRepository.createFranchise(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create franchise:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error creating franchise" },
      { status: 500 }
    );
  }
}

