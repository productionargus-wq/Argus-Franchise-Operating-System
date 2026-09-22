import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export async function GET() {
  const franchises = dbRepository.getFranchises();
  return NextResponse.json(franchises);
}
