import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const orgs = await dbRepository.getOrganizations(status);
    return NextResponse.json(orgs);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to fetch organizations:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch organizations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await dbRepository.registerOrganization(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to register organization:", error);
    return NextResponse.json({ error: error?.message || "Failed to register organization" }, { status: 400 });
  }
}
