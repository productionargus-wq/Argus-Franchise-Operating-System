import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const order = await dbRepository.getOrderById(params.id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { action, milestoneName, amount, ref, orderStatus } = body;

    if (action === "update_status" && orderStatus) {
      const order = await dbRepository.updateOrderStatus(params.id, orderStatus);
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      return NextResponse.json(order);
    }

    if (action === "record_payment" && milestoneName) {
      const order = await dbRepository.updateOrderMilestone(params.id, milestoneName, {
        amount: Number(amount) || 0,
        ref: ref || `UTR-${Date.now()}`,
      });
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      return NextResponse.json(order);
    }

    return NextResponse.json({ error: "Invalid patch action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
