import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    const checkImpact = searchParams.get("impact") === "true";
    if (checkImpact) {
      const impact = await dbRepository.getFranchiseDeleteImpact(params.id, orgId);
      if (!impact) {
        return NextResponse.json({ error: "Franchise not found" }, { status: 404 });
      }
      return NextResponse.json(impact);
    }

    const franchise = await dbRepository.getFranchiseByCode(params.id, orgId);
    if (!franchise) {
      return NextResponse.json({ error: "Franchise not found" }, { status: 404 });
    }
    return NextResponse.json(franchise);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error(`Failed to fetch franchise ${params.id}:`, error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch franchise" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const orgId = body.orgId || searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    const updated = await dbRepository.updateFranchise(params.id, body, orgId);
    if (!updated) {
      return NextResponse.json({ error: "Franchise not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error(`Failed to update franchise ${params.id}:`, error);
    return NextResponse.json(
      { error: error?.message || "Failed to update franchise" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    const targetFranchiseId = searchParams.get("targetFranchiseId") || undefined;
    const result = await dbRepository.deleteFranchiseWithRerouting(params.id, targetFranchiseId, orgId);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Franchise not found or could not be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Franchise deleted and active leads rerouted successfully",
      ...result,
    });
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error(`Failed to delete franchise ${params.id}:`, error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete franchise" },
      { status: 500 }
    );
  }
}
