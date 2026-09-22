import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const quote = dbRepository.getQuotationById(params.id);
  if (!quote) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  return NextResponse.json(quote);
}
