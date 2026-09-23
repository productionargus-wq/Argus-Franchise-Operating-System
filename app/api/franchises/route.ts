import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const franchises = await dbRepository.getFranchises(orgId);
    return NextResponse.json(franchises);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to get franchises:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch franchises" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const orgId = body.orgId || searchParams.get("orgId");
    if (!body.name || !body.code) {
      return NextResponse.json(
        { error: "Franchise Name and Code are required" },
        { status: 400 }
      );
    }
    const result = await dbRepository.createFranchise(body, orgId);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create franchise:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error creating franchise" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const orgId = body.orgId || searchParams.get("orgId");
    const id = body.id || body._id || body.code || searchParams.get("id");

    if (!id || !orgId) {
      return NextResponse.json({ error: "Franchise id and orgId are required" }, { status: 400 });
    }

    const updated = await dbRepository.updateFranchise(id, body, orgId);
    if (!updated) {
      return NextResponse.json({ error: "Franchise not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Failed to update franchise:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error updating franchise" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const orgId = searchParams.get("orgId");

    if (!id || !orgId) {
      return NextResponse.json({ error: "Franchise id and orgId are required" }, { status: 400 });
    }

    const success = await dbRepository.deleteFranchise(id, orgId);
    if (!success) {
      return NextResponse.json({ error: "Franchise not found or could not be deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Franchise deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete franchise:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error deleting franchise" },
      { status: 500 }
    );
  }
}

