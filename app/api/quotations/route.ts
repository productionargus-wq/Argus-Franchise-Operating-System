import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchiseId = searchParams.get("franchiseId");
    const quotes = await dbRepository.getQuotations(franchiseId);
    return NextResponse.json(quotes);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to fetch quotations:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch quotations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const createdBy = body.createdBy || "Franchise User";
    const newQuote = await dbRepository.createQuotation(body, createdBy);
    return NextResponse.json(newQuote, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
