import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const franchiseId = searchParams.get("franchiseId");
  const orders = dbRepository.getOrders(franchiseId);
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quoteId, poNumber, poDate } = body;
    const order = dbRepository.createOrderFromQuotation(quoteId, { poNumber, poDate });
    if (!order) {
      return NextResponse.json({ error: "Quotation could not be converted to order" }, { status: 400 });
    }
    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
