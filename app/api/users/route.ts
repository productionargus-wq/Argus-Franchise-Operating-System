import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || undefined;
    const users = await dbRepository.getUsersByOrg(orgId);
    return NextResponse.json(users);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgId, name, email, role, franchiseId, franchiseName } = body;

    if (!orgId) return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    if (!name || !name.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!email || !email.trim()) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    if (!role) return NextResponse.json({ error: "Role is required" }, { status: 400 });

    const newUser = await dbRepository.createOrganizationPersonnel(orgId, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      franchiseId,
      franchiseName,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to create personnel:", error);
    return NextResponse.json({ error: error?.message || "Failed to create personnel" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const orgId = searchParams.get("orgId");

    if (!userId || !orgId) {
      return NextResponse.json({ error: "userId and orgId are required" }, { status: 400 });
    }

    const success = await dbRepository.deleteUser(userId, orgId);
    return NextResponse.json({ success });
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete user" }, { status: 500 });
  }
}
