import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const franchiseId = searchParams.get("franchiseId");
  const quotes = dbRepository.getQuotations(franchiseId);
  return NextResponse.json(quotes);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const createdBy = body.createdBy || "Franchise User";
    const newQuote = dbRepository.createQuotation(body, createdBy);
    return NextResponse.json(newQuote, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
