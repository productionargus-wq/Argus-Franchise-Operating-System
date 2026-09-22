import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const franchiseId = searchParams.get("franchiseId");
  const customers = await dbRepository.getCustomers(franchiseId);
  return NextResponse.json(customers);
}
