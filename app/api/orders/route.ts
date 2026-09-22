import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchiseId = searchParams.get("franchiseId");
    const orders = await dbRepository.getOrders(franchiseId);
    return NextResponse.json(orders);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quoteId, poNumber, poDate } = body;
    const order = await dbRepository.createOrderFromQuotation(quoteId, { poNumber, poDate });
    if (!order) {
      return NextResponse.json({ error: "Quotation could not be converted to order" }, { status: 400 });
    }
    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
