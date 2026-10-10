import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const policy = await dbRepository.getPartnerPolicy(orgId);
    return NextResponse.json(policy);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to fetch partner policy:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch partner policy" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const orgId = body.orgId || searchParams.get("orgId");
    const tier = body.tier;
    const updates = body.updates;
    const updatedBy = body.updatedBy;

    if (!orgId || !tier || !updates) {
      return NextResponse.json(
        { error: "orgId, tier, and updates are required" },
        { status: 400 }
      );
    }

    const updated = await dbRepository.updatePartnerTierTerms(orgId, tier, updates, updatedBy);
    if (!updated) {
      return NextResponse.json({ error: "Failed to update partner terms" }, { status: 400 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Failed to update partner terms:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
